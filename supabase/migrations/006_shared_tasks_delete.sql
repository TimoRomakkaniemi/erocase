-- Allow task creator to delete their own tasks
CREATE POLICY "Creator can delete own tasks"
  ON shared_tasks FOR DELETE
  USING (created_by = auth.uid());
