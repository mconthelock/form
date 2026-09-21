-- Required before accepting more than 99 checkpoints. Run on the IEDOC schema.
-- No application-level checkpoint count limit. Preserve integer sequence values.
ALTER TABLE JIG_FORM_DETAIL MODIFY (CHECK_SEQ NUMBER(15,0));
ALTER TABLE JIG_CHECKPOINT MODIFY (CHECK_SEQ NUMBER(15,0));
