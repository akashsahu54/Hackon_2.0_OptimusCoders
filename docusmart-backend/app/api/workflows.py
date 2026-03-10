"""Workflow API routes — CRUD and manual triggering (MongoDB)."""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from typing import List

from app.database import get_db
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowTrigger, WorkflowRunResponse,
)
from app.core.dependencies import get_current_user
from app.services.workflow_service import execute_workflow

router = APIRouter(prefix="/workflows", tags=["Workflows"])


def _wf_to_response(wf: dict) -> WorkflowResponse:
    """Convert MongoDB workflow dict to WorkflowResponse schema."""
    return WorkflowResponse(
        id=wf["_id"],
        name=wf["name"],
        trigger_type=wf["trigger_type"],
        trigger_condition=wf.get("trigger_condition"),
        action_type=wf["action_type"],
        action_config=wf.get("action_config"),
        is_active=wf.get("is_active", True),
        run_count=wf.get("run_count", 0),
        created_at=wf.get("created_at"),
    )


def _run_to_response(run: dict) -> WorkflowRunResponse:
    """Convert MongoDB workflow_run dict to WorkflowRunResponse schema."""
    return WorkflowRunResponse(
        id=run["_id"],
        workflow_id=run["workflow_id"],
        document_id=run.get("document_id"),
        status=run["status"],
        executed_at=run.get("executed_at"),
        error_message=run.get("error_message"),
        result_data=run.get("result_data"),
    )


@router.get("", response_model=List[WorkflowResponse])
def list_workflows(
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all workflows for the current user."""
    workflows = list(db.workflows.find({"user_id": current_user["_id"]}))
    return [_wf_to_response(w) for w in workflows]


@router.post("", response_model=WorkflowResponse, status_code=201)
def create_workflow(
    data: WorkflowCreate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new workflow."""
    wf_id = str(uuid.uuid4())
    wf_doc = {
        "_id": wf_id,
        "name": data.name,
        "trigger_type": data.trigger_type,
        "trigger_condition": data.trigger_condition,
        "action_type": data.action_type,
        "action_config": data.action_config,
        "is_active": True,
        "user_id": current_user["_id"],
        "run_count": 0,
        "created_at": datetime.utcnow(),
    }
    db.workflows.insert_one(wf_doc)
    return _wf_to_response(wf_doc)


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update a workflow configuration."""
    wf = db.workflows.find_one({"_id": workflow_id, "user_id": current_user["_id"]})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    update_fields = data.model_dump(exclude_unset=True)
    if update_fields:
        db.workflows.update_one({"_id": workflow_id}, {"$set": update_fields})

    updated_wf = db.workflows.find_one({"_id": workflow_id})
    return _wf_to_response(updated_wf)


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(
    workflow_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete a workflow."""
    result = db.workflows.delete_one({"_id": workflow_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")


@router.post("/{workflow_id}/trigger", response_model=WorkflowRunResponse)
def trigger_workflow(
    workflow_id: str,
    data: WorkflowTrigger,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Manually trigger a workflow for testing."""
    wf = db.workflows.find_one({"_id": workflow_id, "user_id": current_user["_id"]})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run_id = str(uuid.uuid4())
    run_doc = {
        "_id": run_id,
        "workflow_id": workflow_id,
        "document_id": str(data.document_id) if data.document_id else None,
        "status": "running",
        "executed_at": datetime.utcnow(),
    }
    db.workflow_runs.insert_one(run_doc)

    try:
        result = execute_workflow(wf, str(data.document_id) if data.document_id else None, db)
        db.workflow_runs.update_one({"_id": run_id}, {"$set": {
            "status": "completed",
            "result_data": result,
        }})
        db.workflows.update_one({"_id": workflow_id}, {"$inc": {"run_count": 1}})
    except Exception as e:
        db.workflow_runs.update_one({"_id": run_id}, {"$set": {
            "status": "failed",
            "error_message": str(e),
        }})

    updated_run = db.workflow_runs.find_one({"_id": run_id})
    return _run_to_response(updated_run)
