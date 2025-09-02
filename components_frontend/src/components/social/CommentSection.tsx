"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Reply, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

export interface Comment {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  createdAt: string
  likesCount: number
  isLiked: boolean
  replies?: Comment[]
}

export interface CommentSectionProps {
  workId: string
  comments: Comment[]
  currentUserId?: string
  onAddComment?: (content: string) => void
  onReplyComment?: (commentId: string, content: string) => void
  onLikeComment?: (commentId: string) => void
  onDeleteComment?: (commentId: string) => void
  className?: string
}

export function CommentSection({
  workId,
  comments,
  currentUserId,
  onAddComment,
  onReplyComment,
  onLikeComment,
  onDeleteComment,
  className,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment)
      setNewComment("")
    }
  }

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyComment?.(commentId, replyContent)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
          <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
          </div>

          <p className="text-sm leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeComment?.(comment.id)}
              className={`h-auto p-1 ${comment.isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
              {comment.likesCount > 0 && comment.likesCount}
            </Button>

            {!isReply && (
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)} className="h-auto p-1">
                <Reply className="h-4 w-4 mr-1" />
                Ответить
              </Button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="space-y-2">
              <Textarea
                placeholder="Написать ответ..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                  Ответить
                </Button>
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Комментарии ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {currentUserId && (
          <div className="space-y-3">
            <Textarea
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Отправить комментарий
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Пока нет комментариев. Будьте первым!</p>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </div>
      </CardContent>
    </Card>
  )
}
