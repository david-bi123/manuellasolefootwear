export type ActionResult<T = undefined> = {
  ok: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
};

export function actionOk<T>(message?: string, data?: T): ActionResult<T> {
  return { ok: true, message, data };
}

export function actionError<T = undefined>(
  error: string,
  fieldErrors?: Record<string, string>,
): ActionResult<T> {
  return { ok: false, error, fieldErrors };
}