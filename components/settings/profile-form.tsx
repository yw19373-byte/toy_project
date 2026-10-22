"use client";

import { useActionState } from "react";

import { updateDisplayName } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, pending] = useActionState(
    updateDisplayName,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field data-invalid={state?.error ? true : undefined}>
          <FieldLabel htmlFor="display-name">표시 이름</FieldLabel>
          <Input
            id="display-name"
            name="displayName"
            defaultValue={displayName}
            maxLength={40}
            aria-invalid={state?.error ? true : undefined}
          />
          {state?.error ? <FieldError>{state.error}</FieldError> : null}
          {state?.saved ? <FieldDescription>저장했습니다.</FieldDescription> : null}
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </FieldGroup>
    </form>
  );
}
