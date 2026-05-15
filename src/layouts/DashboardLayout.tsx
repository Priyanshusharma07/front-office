'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  CreditCardOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

import { useRouter, usePathname } from 'next/navigation';
// import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // const { user } = useUser();
  // const { signOut } = useClerk();
  
  // Mock user for testing
  const user = {
    fullName: 'Test User',
    primaryEmailAddress: { emailAddress: 'test@example.com' }
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/inbox', icon: <MessageOutlined />, label: 'Inbox' },
    { key: '/automations', icon: <ThunderboltOutlined />, label: 'Automations' },
    { key: '/integrations', icon: <InstagramOutlined />, label: 'Integrations' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/team', icon: <TeamOutlined />, label: 'Team' },
    { key: '/billing', icon: <CreditCardOutlined />, label: 'Billing' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }} suppressHydrationWarning>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        className="border-r border-gray-100"
        width={260}
        suppressHydrationWarning
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-50" suppressHydrationWarning>
           <div className={`text-xl font-bold text-indigo-600 transition-all ${collapsed ? 'scale-0 w-0' : 'scale-100'}`} suppressHydrationWarning>
              BrokerageX
           </div>
           {collapsed && <ThunderboltOutlined className="text-xl text-indigo-600" />}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems.map(item => ({
            ...item,
            onClick: () => router.push(item.key)
          }))}
          className="mt-4 border-none"
        />
      </Sider>
      <Layout suppressHydrationWarning>
        <Header className="bg-white px-6 flex items-center justify-between border-b border-gray-100 h-16" suppressHydrationWarning>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          
          <div className="flex items-center gap-6" suppressHydrationWarning>
            <Badge count={5} size="small">
               <Button type="text" icon={<BellOutlined className="text-lg text-gray-500" />} />
            </Badge>
            
            <div className="flex items-center gap-3 border-l pl-6 border-gray-100" suppressHydrationWarning>
               <div className="text-right hidden sm:block" suppressHydrationWarning>
                  <div className="text-sm font-semibold text-gray-900" suppressHydrationWarning>{user?.fullName || 'User'}</div>
                  <div className="text-xs text-gray-500" suppressHydrationWarning>{user?.primaryEmailAddress?.emailAddress}</div>
               </div>
               {/* <UserButton /> */}
               <Avatar icon={<UserOutlined />} />
            </div>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-xl shadow-sm overflow-auto" suppressHydrationWarning>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

