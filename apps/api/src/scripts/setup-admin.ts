import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'
import path from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('Missing admin credentials')
  }

  try {
    // Criar usuário admin
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (userError) throw userError

    // Atualizar perfil como admin
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('id', userData.user.id)

    if (profileError) throw profileError

    // Criar primeira API key
    const apiKey = `jbs_${randomBytes(32).toString('hex')}`
    
    const { error: apiKeyError } = await supabase
      .from('api_keys')
      .insert({
        key: apiKey,
        name: 'Default Admin API Key',
        created_by: userData.user.id
      })

    if (apiKeyError) throw apiKeyError

    console.log('Admin setup completed successfully!')
    console.log('API Key:', apiKey)

  } catch (error) {
    console.error('Error setting up admin:', error)
    process.exit(1)
  }
}

setupAdmin().catch(console.error) 