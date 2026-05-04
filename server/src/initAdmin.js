import { User } from './models/User.js'

export async function ensureAdminExists() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'admin'

  if (!adminEmail || !adminPassword) {
    // nothing to do if admin credentials not provided
    return
  }

  const existing = await User.findOne({ email: adminEmail }).select('+passwordHash')
  if (existing) {
    return
  }

  const passwordHash = await User.hashPassword(adminPassword)

  await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'admin',
    access: 'all',
    status: 'active',
  })

  console.log('Initial admin user created:', adminEmail)
}
