'use client';

import React from 'react';
import { Button, Skeleton, Empty, Tooltip, Typography, Badge } from 'antd';
import {
  HeartOutlined,
  MessageOutlined,
  LinkOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import type { InstagramPost } from '../types';

const { Text } = Typography;

/* ── Skeleton grid ──────────────────────────────────── */
export function PostsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <Skeleton.Image active className="!w-full !h-48 !rounded-none" />
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Single post card ───────────────────────────────── */
interface PostCardProps {
  post: InstagramPost;
  onSelectPost: (post: InstagramPost) => void;
}

function PostCard({ post, onSelectPost }: PostCardProps) {
  const isVideo = post.mediaType === 'VIDEO';
  const imageUrl = post.thumbnailUrl || post.mediaUrl;
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Media */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.caption?.slice(0, 60) || 'Instagram post'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <PlayCircleOutlined style={{ fontSize: 40 }} />
          </div>
        )}

        {/* Video badge */}
        {isVideo && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <PlayCircleOutlined style={{ fontSize: 10 }} /> Video
          </div>
        )}

        {/* Carousel badge */}
        {post.mediaType === 'CAROUSEL_ALBUM' && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            ⊞ Album
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            id={`view-comments-${post.id}`}
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => onSelectPost(post)}
            className="rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', border: 'none' }}
          >
            View Comments
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        {/* Caption */}
        {post.caption ? (
          <Text className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {post.caption}
          </Text>
        ) : (
          <Text type="secondary" className="text-xs italic">
            No caption
          </Text>
        )}

        {/* Stats + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tooltip title="Likes">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <HeartOutlined className="text-pink-500" />
                <span className="font-medium">{post.likeCount.toLocaleString()}</span>
              </span>
            </Tooltip>
            <Tooltip title="Comments">
              <button
                onClick={() => onSelectPost(post)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                <Badge
                  count={post.commentsCount}
                  size="small"
                  style={{ backgroundColor: '#6366f1' }}
                >
                  <MessageOutlined />
                </Badge>
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Text type="secondary" className="text-xs">
              {timeAgo}
            </Text>
            {post.permalink && (
              <Tooltip title="Open on Instagram">
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkOutlined style={{ fontSize: 12 }} />
                </a>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ PostsGrid ═════════════════════════════════════════ */
interface PostsGridProps {
  posts: InstagramPost[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onSelectPost: (post: InstagramPost) => void;
}

export function PostsGrid({
  posts,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onSelectPost,
}: PostsGridProps) {
  if (isLoading) return <PostsGridSkeleton />;

  if (posts.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span className="text-gray-500 text-sm">
            No posts found. Posts will appear here once your account has content.
          </span>
        }
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onSelectPost={onSelectPost} />
        ))}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            id="load-more-posts-btn"
            loading={isFetchingNextPage}
            onClick={onLoadMore}
            className="rounded-xl px-8"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load More Posts'}
          </Button>
        </div>
      )}
    </div>
  );
}
