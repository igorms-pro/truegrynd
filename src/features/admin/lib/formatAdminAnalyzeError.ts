type TranslateErrors = (key: string, values?: Record<string, string>) => string;

export function formatAdminAnalyzeError(code: string, tErr: TranslateErrors): string {
  switch (code) {
    case 'no_session':
      return tErr('analyzeNoSession');
    case 'ai_unconfigured':
      return tErr('analyzeUnconfigured');
    case 'ai_failed':
      return tErr('analyzeFailed');
    case 'forbidden':
      return tErr('analyzeForbidden');
    case 'not_found':
      return tErr('analyzeNotFound');
    case 'not_pending':
      return tErr('analyzeNotPending');
    case 'server_misconfigured':
      return tErr('analyzeServerMisconfigured');
    case 'persist_failed':
      return tErr('analyzePersistFailed');
    default:
      return tErr('analyzeGeneric', { code });
  }
}
