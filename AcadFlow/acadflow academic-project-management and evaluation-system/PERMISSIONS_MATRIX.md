# AcadFlow — Permissions Matrix

## Four-Role Operation Mapping

| Resource / Action | HOD (Dept Admin) | Student | Project Mentor | External Evaluator | Backend Authorization Rule |
|---|---|---|---|---|---|
| **Department Management** | | | | | |
| View Department Profile | Allowed (Own Dept) | Allowed (Own Dept) | Allowed (Own Dept) | Denied | Scoped by `user.departmentId` |
| Update Department Settings | Allowed (Own Dept) | Denied | Denied | Denied | Strict HOD check + own departmentId |
| Manage Semesters / Terms | Allowed (Own Dept) | Denied | Denied | Denied | Strict HOD check |
| **User & Account Management** | | | | | |
| Invite Users (Student/Faculty/Evaluator) | Allowed (Own Dept) | Denied | Denied | Denied | Token generated with department constraint |
| Suspend / Reactivate User Account | Allowed (Own Dept) | Denied | Denied | Denied | Cannot suspend self; audited |
| Self-Registration | Controlled | Controlled | Controlled | Controlled | No public self-sign up without invitation |
| **Teams & Membership** | | | | | |
| Create Student Team | Allowed (Assigned Dept) | Allowed (Own Batch) | Denied | Denied | Student must not belong to active team |
| Manage Team Members | Allowed | Allowed (Team Leader) | Denied | Denied | Only team leader before proposal approved |
| View Team Details | Allowed (Own Dept) | Allowed (Own Team) | Allowed (Assigned) | Allowed (Assigned) | Object-level membership verification |
| **Proposals** | | | | | |
| Draft / Edit Proposal | Denied | Allowed (Own Team) | Denied | Denied | Proposal state must be DRAFT/REVISION_REQUESTED |
| Submit Proposal | Denied | Allowed (Team Leader) | Denied | Denied | Validates submission window open |
| Approve / Reject Proposal | Allowed (Own Dept) | Denied | Denied | Denied | Strict HOD workflow transition |
| Request Revisions | Allowed (Own Dept) | Denied | Allowed (If delegated)| Denied | Requires feedback comment |
| **Mentor Allocation** | | | | | |
| Assign / Reassign Mentor | Allowed (Own Dept) | Denied | Denied | Denied | Validates mentor capacity & department |
| Monitor Mentor Workload | Allowed (Own Dept) | Denied | Denied (Self only) | Denied | Workload aggregation across department |
| **Milestones & Tasks** | | | | | |
| Create Milestones / Sprints | Allowed | Allowed (Own Team) | Allowed (Assigned) | Denied | Project-scoped |
| Assign & Update Tasks | Allowed | Allowed (Own Team) | Allowed (Assigned) | Denied | Project-scoped |
| Submit Progress Updates | Denied | Allowed (Own Team) | Denied | Denied | Appends progress timeline |
| **Document Management** | | | | | |
| Upload Document / Revision | Denied | Allowed (Own Team) | Allowed (Assigned) | Denied | MIME & size check; random storage key |
| Download Private Document | Allowed (Own Dept) | Allowed (Own Team) | Allowed (Assigned) | Allowed (Assigned) | Authorization streaming check; no public URL |
| View Revision History | Allowed (Own Dept) | Allowed (Own Team) | Allowed (Assigned) | Allowed (Assigned) | Project-scoped |
| **Reviews & Feedback** | | | | | |
| Schedule Review Milestone | Allowed (Own Dept) | Denied | Allowed (Assigned) | Denied | Calendar event dispatch |
| Record Meeting Minutes / Notes | Allowed | Allowed (Own Team) | Allowed (Assigned) | Denied | Append-only note log |
| Submit Mentor Feedback | Denied | Denied | Allowed (Assigned) | Denied | Assigned mentor only |
| Verify Corrections | Denied | Denied | Allowed (Assigned) | Denied | Checks resolved feedback items |
| **External Evaluations** | | | | | |
| Assign External Evaluator | Allowed (Own Dept) | Denied | Denied | Denied | Checks evaluator conflict declaration |
| Enter Rubric Scores (Draft) | Denied | Denied | Denied | Allowed (Assigned) | Evaluator assignment check; rubric range |
| Finalize Evaluation | Denied | Denied | Denied | Allowed (Assigned) | Validates all mandatory criteria scored |
| Edit Finalized Evaluation | Denied | Denied | Denied | Denied | Prohibited without audited HOD reopening |
| **Results & Moderation** | | | | | |
| Moderate Outlier Scores | Allowed (Own Dept) | Denied | Denied | Denied | Audited moderation override log |
| Publish Official Results | Allowed (Own Dept) | Denied | Denied | Denied | Marks `isPublished = true` |
| View Official Results | Allowed (Own Dept) | Allowed (When Published)| Allowed (Assigned) | Allowed (Assigned) | Students cannot view until published |
| **Reports & Audit Logs** | | | | | |
| Generate PDF Project Summary | Allowed (Own Dept) | Allowed (Own Team) | Allowed (Assigned) | Denied | PDFKit server-side generator |
| Generate Excel Department Marks | Allowed (Own Dept) | Denied | Denied | Denied | ExcelJS export scoped to department |
| View Security Audit Logs | Allowed (Own Dept) | Denied | Denied | Denied | Immutable audit trail query |
