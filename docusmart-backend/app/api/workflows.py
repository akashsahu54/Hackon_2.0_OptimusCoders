"""Workflow API routes — CRUD and manual triggering."""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowTrigger, WorkflowRunResponse,
)
from app.core.dependencies import get_current_user
from app.services.workflow_service import execute_workflow

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("", response_model=List[WorkflowResponse])
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all workflows for the current user."""
    workflows = db.query(Workflow).filter(Workflow.user_id == current_user.id).all()
    return [WorkflowResponse.model_validate(w) for w in workflows]


@router.post("", response_model=WorkflowResponse, status_code=201)
def create_workflow(
    data: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new workflow."""
    workflow = Workflow(
        name=data.name,
        trigger_type=data.trigger_type,
        trigger_condition=data.trigger_condition,
        action_type=data.action_type,
        action_config=data.action_config,
        user_id=current_user.id,
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return WorkflowResponse.model_validate(workflow)


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: uuid.UUID,
    data: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a workflow configuration."""
    wf = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id,
    ).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(wf, field, value)

    db.commit()
    db.refresh(wf)
    return WorkflowResponse.model_validate(wf)


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(
    workflow_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a workflow."""
    wf = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id,
    ).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(wf)
    db.commit()


@router.post("/{workflow_id}/trigger", response_model=WorkflowRunResponse)
def trigger_workflow(
    workflow_id: uuid.UUID,
    data: WorkflowTrigger,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger a workflow for testing."""
    wf = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id,
    ).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run = WorkflowRun(
        workflow_id=wf.id,
        document_id=data.document_id,
        status="running",
        executed_at=datetime.utcnow(),
    )
    db.add(run)
    db.commit()

    try:
        result = execute_workflow(wf, str(data.document_id), db)
        run.status = "completed"
        run.result_data = result
        wf.run_count += 1
    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)

    db.commit()
    db.refresh(run)
    return WorkflowRunResponse.model_validate(run)
