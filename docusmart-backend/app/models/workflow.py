"""
Workflow & WorkflowRun — MongoDB document schema reference.

Collection: workflows
{
    _id: str(uuid4),
    name: str,
    trigger_type: str,
    trigger_condition: dict | None,
    action_type: str,
    action_config: dict | None,
    is_active: bool,
    user_id: str,
    run_count: int,
    created_at: datetime,
}

Collection: workflow_runs
{
    _id: str(uuid4),
    workflow_id: str,
    document_id: str | None,
    status: str,
    executed_at: datetime | None,
    error_message: str | None,
    result_data: dict | None,
}
"""
