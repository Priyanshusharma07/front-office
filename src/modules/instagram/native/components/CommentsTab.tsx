'use client';

import React, { useState } from 'react';
import {
  Table, Button, Modal, Input, Tag, Empty, Tooltip,
  Popconfirm, Typography, App, Skeleton, Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  MessageOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useNativeComments } from '../hooks/useNativeComments';
import type { InstagramPost, InstagramComment } from '../types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ── Reply Modal ─────────────────────────────────────── */
interface ReplyModalProps {
  open: boolean;
  comment: InstagramComment | null;
  onClose: () => void;
  onReply: (args: { commentId: string; message: string }) => Promise<void>;
  isReplying: boolean;
}

function ReplyModal({ open, comment, onClose, onReply, isReplying }: ReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const { message: antMessage } = App.useApp();

  const handleSend = async () => {
    if (!comment || !replyText.trim()) return;
    try {
      await onReply({ commentId: comment.commentId, message: replyText.trim() });
      antMessage.success('Reply sent successfully!');
      setReplyText('');
      onClose();
    } catch {
      antMessage.error('Failed to send reply. Please try again.');
    }
  };

  const handleClose = () => {
    setReplyText('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-indigo-500" />
          <span>Reply to Comment</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          loading={isReplying}
          disabled={!replyText.trim()}
          onClick={handleSend}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
        >
          Send Reply
        </Button>,
      ]}
      className="max-w-lg"
    >
      {comment && (
        <div className="space-y-4">
          {/* Original comment */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833ab4] to-[#fd1d1d] flex items-center justify-center flex-shrink-0">
                <Text className="text-white text-xs font-bold">
                  {comment.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </div>
              <div className="flex-1 min-w-0">
                <Text strong className="text-sm block">
                  @{comment.username}
                </Text>
                <Paragraph className="text-sm text-gray-700 !mb-0 mt-1">{comment.text}</Paragraph>
                <Text type="secondary" className="text-xs">
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </Text>
              </div>
            </div>
          </div>

          {/* Reply input */}
          <div>
            <Text strong className="text-sm block mb-2">
              Your Reply
            </Text>
            <TextArea
              id="comment-reply-input"
              rows={3}
              placeholder="Write your reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength={1000}
              showCount
              className="rounded-xl"
              autoFocus
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── Comments table for a single post ───────────────── */
interface PostCommentsViewProps {
  post: InstagramPost;
  onBack: () => void;
}

function PostCommentsView({ post, onBack }: PostCommentsViewProps) {
  const { message: antMessage } = App.useApp();
  const [replyTarget, setReplyTarget] = useState<InstagramComment | null>(null);
  const { comments, isLoading, error, replyToComment, isReplying, hideComment, isHiding } =
    useNativeComments(post.mediaId);

  const columns: ColumnsType<InstagramComment> = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      width: 130,
      render: (username: string) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833ab4] to-[#fd1d1d] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">
              {username?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <Text className="text-sm font-medium">@{username}</Text>
        </div>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, record) => (
        <div className="space-y-1">
          <Paragraph
            className={`!mb-0 text-sm ${record.hidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
          >
            {text}
          </Paragraph>
          {record.replied && (
            <Tag color="blue" className="rounded-full text-xs m-0">
              Replied
            </Tag>
          )}
          {record.hidden && (
            <Tag color="default" className="rounded-full text-xs m-0">
              Hidden
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 130,
      render: (ts: string) => (
        <Text type="secondary" className="text-xs">
          {formatDistanceToNow(new Date(ts), { addSuffix: true })}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Reply to comment">
            <Button
              id={`reply-comment-${record.id}`}
              size="small"
              icon={<MessageOutlined />}
              onClick={() => setReplyTarget(record)}
              className="rounded-lg"
              type="text"
            />
          </Tooltip>

          <Popconfirm
            title={record.hidden ? 'Unhide this comment?' : 'Hide this comment?'}
            onConfirm={async () => {
              try {
                await hideComment({ commentId: record.commentId, hide: !record.hidden });
                antMessage.success(record.hidden ? 'Comment unhidden.' : 'Comment hidden.');
              } catch {
                antMessage.error('Failed to update comment visibility.');
              }
            }}
            okText="Confirm"
          >
            <Tooltip title={record.hidden ? 'Unhide' : 'Hide comment'}>
              <Button
                id={`hide-comment-${record.id}`}
                size="small"
                icon={record.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                loading={isHiding}
                className="rounded-lg"
                type="text"
                danger={!record.hidden}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          id="comments-back-btn"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          size="small"
          className="rounded-xl"
        >
          All Posts
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          {(post.thumbnailUrl || post.mediaUrl) && (
            <img
              src={post.thumbnailUrl || post.mediaUrl}
              alt=""
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <Text strong className="text-sm block truncate">
              {post.caption?.slice(0, 60) || 'Post'}
            </Text>
            <Text type="secondary" className="text-xs">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </Text>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message="Failed to load comments"
          description="Unable to fetch comments for this post. Please try again."
          showIcon
          className="rounded-xl"
        />
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table<InstagramComment>
          columns={columns}
          dataSource={isLoading ? undefined : comments}
          rowKey="id"
          loading={isLoading}
          pagination={comments.length > 20 ? { pageSize: 20, size: 'small' } : false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No comments on this post yet"
                className="py-8"
              />
            ),
          }}
          size="middle"
          className="instagram-comments-table"
        />
      </div>

      {/* Reply modal */}
      <ReplyModal
        open={Boolean(replyTarget)}
        comment={replyTarget}
        onClose={() => setReplyTarget(null)}
        onReply={replyToComment}
        isReplying={isReplying}
      />
    </div>
  );
}

/* ═══ CommentsTab ═══════════════════════════════════════
   Entry point: shows a post picker, then drills into comments
════════════════════════════════════════════════════════ */
interface CommentsTabProps {
  posts: InstagramPost[];
  postsLoading: boolean;
  /** Pre-select a post (e.g. drilled from Posts tab) */
  initialPost?: InstagramPost | null;
  onClearInitialPost?: () => void;
}

export function CommentsTab({ posts, postsLoading, initialPost, onClearInitialPost }: CommentsTabProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(initialPost ?? null);

  // Sync if parent pushes a new initialPost
  React.useEffect(() => {
    if (initialPost) setSelectedPost(initialPost);
  }, [initialPost]);

  if (selectedPost) {
    return <PostCommentsView post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  if (postsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No posts available. Connect a post to view comments."
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-3">
      <Text type="secondary" className="text-sm">
        Select a post to view and manage its comments.
      </Text>

      {posts.map((post) => (
        <button
          key={post.id}
          id={`select-post-${post.id}`}
          onClick={() => setSelectedPost(post)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-150 text-left cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            {post.thumbnailUrl || post.thumbnail_url || post.mediaUrl || post.media_url ? (
              <img
                src={post.thumbnailUrl || post.thumbnail_url || post.mediaUrl || post.media_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <MessageOutlined />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Text className="text-sm text-gray-700 line-clamp-1 block">
              {post.caption?.slice(0, 80) || 'No caption'}
            </Text>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageOutlined />
                {post.commentsCount ?? post.comments_count ?? 0} comment{(post.commentsCount ?? post.comments_count ?? 0) !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.timestamp || new Date().toISOString()), { addSuffix: true })}
              </span>
            </div>
          </div>

          <Tag
            color="purple"
            className="rounded-full text-xs m-0 flex-shrink-0"
          >
            View Comments →
          </Tag>
        </button>
      ))}
    </div>
  );
}
