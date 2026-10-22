export function requestErrorMessage(error, resource) {
  if (error?.name === 'AbortError') {
    return 'A consulta demorou demais. Verifique a conexão e tente novamente.';
  }
  if (error instanceof TypeError) {
    return `Não foi possível carregar ${resource}. Verifique sua conexão com a internet.`;
  }
  return error?.message || `Ocorreu um erro ao carregar ${resource}.`;
}
