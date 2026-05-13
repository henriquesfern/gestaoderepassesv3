export default async function handler(req: any, res: any) {
  try {
    // CORS básico
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // Método inválido
    if (req.method !== 'POST') {
      return res.status(405).json({
        ok: false,
        stage: 'method',
        message: 'Método não permitido. Use POST.',
        method: req.method
      });
    }

    // Diagnóstico de ambiente e body
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    return res.status(200).json({
      ok: true,
      stage: 'alive',
      message: 'Function /api/ai está ativa.',
      hasGeminiKey,
      bodyType: typeof req.body,
      hasBody: !!req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[api/ai][diagnostico] erro:', error);

    return res.status(500).json({
      ok: false,
      stage: 'catch',
      message: error?.message || 'Erro inesperado no diagnóstico da função.'
    });
  }
}