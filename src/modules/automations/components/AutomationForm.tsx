'use client';

import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Space, Typography } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AutomationRule, TriggerType } from '@/types/automation';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  triggerType: z.enum(['ALL_COMMENTS', 'KEYWORDS', 'REGEX']),
  keywords: z.string().optional(),
  replyMessage: z.string().min(5, 'Message must be at least 5 characters'),
  delayTime: z.number().min(0).max(60),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface AutomationFormProps {
  initialValues?: Partial<AutomationRule>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const { Text } = Typography;

export default function AutomationForm({ initialValues, onSubmit, onCancel }: AutomationFormProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name || '',
      triggerType: initialValues?.triggerType || 'ALL_COMMENTS',
      keywords: initialValues?.keywords?.join(', ') || '',
      replyMessage: initialValues?.replyMessage || '',
      delayTime: initialValues?.delayTime || 0,
      isActive: initialValues?.isActive ?? true,
    },
  });

  const triggerType = watch('triggerType');

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-4">
      <Form.Item label="Rule Name" validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} placeholder="e.g. Sales Inquiry Reply" />}
        />
      </Form.Item>

      <Form.Item label="Trigger Type">
        <Controller
          name="triggerType"
          control={control}
          render={({ field }) => (
            <Select {...field} options={[
              { value: 'ALL_COMMENTS', label: 'All Comments' },
              { value: 'KEYWORDS', label: 'Keyword Match' },
              { value: 'REGEX', label: 'Regex Pattern' },
            ]} />
          )}
        />
      </Form.Item>

      {triggerType !== 'ALL_COMMENTS' && (
        <Form.Item 
          label={triggerType === 'KEYWORDS' ? 'Keywords (comma separated)' : 'Regex Pattern'}
          validateStatus={errors.keywords ? 'error' : ''}
          help={errors.keywords?.message}
        >
          <Controller
            name="keywords"
            control={control}
            render={({ field }) => <Input {...field} placeholder={triggerType === 'KEYWORDS' ? 'price, cost, how much' : '^hello.*'} />}
          />
        </Form.Item>
      )}

      <Form.Item label="Reply Message" validateStatus={errors.replyMessage ? 'error' : ''} help={errors.replyMessage?.message}>
        <Controller
          name="replyMessage"
          control={control}
          render={({ field }) => <Input.TextArea {...field} rows={4} placeholder="Type your automated reply here..." />}
        />
        <Text type="secondary" className="text-xs">Pro tip: Use {`{username}`} to personalize the reply.</Text>
      </Form.Item>

      <div className="flex gap-8">
        <Form.Item label="Delay (Minutes)" className="flex-1">
          <Controller
            name="delayTime"
            control={control}
            render={({ field }) => <InputNumber {...field} min={0} max={60} className="w-full" />}
          />
        </Form.Item>

        <Form.Item label="Active" valuePropName="checked">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => <Switch {...field} checked={field.value} />}
          />
        </Form.Item>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">Save Automation</Button>
      </div>
    </Form>
  );
}
