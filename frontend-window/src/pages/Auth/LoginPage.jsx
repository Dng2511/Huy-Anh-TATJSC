import { useState } from 'react'
import { Form, Input, Button, Card, Typography, notification } from 'antd'
import { useAuth } from '../../context/AuthContext'

const { Title } = Typography

const THEME = {
  colorPrimary: '#0e6b63',
  bg: '#f6f8f4',
  cardBg: '#ffffff',
  heading: '#0d2524',
  borderRadius: 14,
}

export default function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
    } catch (err) {
      notification.error({ message: 'Đăng nhập thất bại', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.bg, padding: 24 }}>
      <Card style={{ width: 420, borderRadius: THEME.borderRadius, background: THEME.cardBg, boxShadow: '0 8px 30px rgba(21,42,38,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <Title level={3} style={{ margin: 0, color: THEME.heading, fontFamily: 'Manrope, Be Vietnam Pro, sans-serif' }}>Hệ thống quản trị</Title>
          <div style={{ color: '#6b786f', marginTop: 6 }}>Đăng nhập để tiếp tục</div>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ background: THEME.colorPrimary, borderColor: THEME.colorPrimary, borderRadius: 10, height: 44, fontSize: 16 }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
