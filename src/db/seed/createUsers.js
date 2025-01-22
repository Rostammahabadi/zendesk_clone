import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const users = [
  {
    id: '077c2c0a-8138-4f25-a7b5-1ed7e4ee5dea',
    email: 'admin@acme.com',
    first_name: 'Alice',
    last_name: 'Admin',
    role: 'admin',
    company_id: 'f7066f75-0b5a-4524-8b77-6abf0419c0ff',
    title: 'CEO',
    avatar_url: 'https://example.com/avatar1.png',
    phone_number: '123-456-7890',
    password: 'Password123!' // You should use a more secure password in production
  },
  {
    id: '17815e37-90bb-4799-9899-08f6a2aa3b73',
    email: 'agent@acme.com',
    first_name: 'Bob',
    last_name: 'Agent',
    role: 'agent',
    company_id: 'f7066f75-0b5a-4524-8b77-6abf0419c0ff',
    title: 'Support Agent',
    avatar_url: 'https://example.com/avatar2.png',
    phone_number: '234-567-8901',
    password: 'Password123!'
  },
  {
    id: '08e88545-c475-4ef9-bef7-de838330b974',
    email: 'customer@acme.com',
    first_name: 'Charlie',
    last_name: 'Customer',
    role: 'customer',
    company_id: 'f7066f75-0b5a-4524-8b77-6abf0419c0ff',
    title: 'VIP Client',
    avatar_url: 'https://example.com/avatar3.png',
    phone_number: '345-678-9012',
    password: 'Password123!'
  },
  {
    id: '2bea659d-4633-4eae-8433-5fa21093e2b8',
    email: 'admin@globex.com',
    first_name: 'Diana',
    last_name: 'Admin',
    role: 'admin',
    company_id: 'c7a2f7c3-5974-4784-b2cf-5544d981bb88',
    title: 'CTO',
    avatar_url: 'https://example.com/avatar4.png',
    phone_number: '456-789-0123',
    password: 'Password123!'
  },
  {
    id: '39d99175-03d3-4351-9bca-fcce805f39d9',
    email: 'agent@globex.com',
    first_name: 'Evan',
    last_name: 'Agent',
    role: 'agent',
    company_id: 'c7a2f7c3-5974-4784-b2cf-5544d981bb88',
    title: 'Support Agent',
    avatar_url: 'https://example.com/avatar5.png',
    phone_number: '567-890-1234',
    password: 'Password123!'
  }
]

async function createUsers() {
  try {
    for (const user of users) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name
        },
        app_metadata: {
          role: user.role
        }
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError)
        continue
      }

      console.log(`Successfully created user: ${user.email}`)
    }

    console.log('Finished creating users')
  } catch (error) {
    console.error('Error in createUsers:', error)
  }
}

createUsers() 