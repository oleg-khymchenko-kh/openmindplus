export default async function healthRoutes(app) {
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
}
