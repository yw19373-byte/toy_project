"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthAction = (
  state: AuthState,
  formData: FormData,
) => Promise<AuthState>;

function CredentialsForm({
  action,
  submitLabel,
  idPrefix,
  autoComplete,
}: {
  action: AuthAction;
  submitLabel: string;
  idPrefix: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-email`}>이메일</FieldLabel>
          <Input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field data-invalid={state?.error ? true : undefined}>
          <FieldLabel htmlFor={`${idPrefix}-password`}>비밀번호</FieldLabel>
          <Input
            id={`${idPrefix}-password`}
            name="password"
            type="password"
            autoComplete={autoComplete}
            minLength={6}
            required
            aria-invalid={state?.error ? true : undefined}
          />
          <FieldDescription>6자 이상 입력해 주세요.</FieldDescription>
          {state?.error ? <FieldError>{state.error}</FieldError> : null}
          {state?.notice ? <FieldDescription>{state.notice}</FieldDescription> : null}
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "처리 중..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function AuthForms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">나의 자기계발 앱</CardTitle>
        <CardDescription>로그인하면 내 설정을 볼 수 있어요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sign-in">
          <TabsList>
            <TabsTrigger value="sign-in">로그인</TabsTrigger>
            <TabsTrigger value="sign-up">가입</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <CredentialsForm
              action={signIn}
              submitLabel="로그인"
              idPrefix="sign-in"
              autoComplete="current-password"
            />
          </TabsContent>
          <TabsContent value="sign-up">
            <CredentialsForm
              action={signUp}
              submitLabel="가입하기"
              idPrefix="sign-up"
              autoComplete="new-password"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
