-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves or others to their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Fix conversations SELECT policy - use a simpler subquery
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
  )
);

-- Fix conversation_participants SELECT policy - avoid self-reference
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
  )
);

-- Fix conversation_participants INSERT policy - simpler logic
CREATE POLICY "Users can add themselves or others to their conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- User is adding themselves (for new conversations)
    user_id = auth.uid() 
    OR 
    -- User is already in the conversation (adding someone else)
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  )
);