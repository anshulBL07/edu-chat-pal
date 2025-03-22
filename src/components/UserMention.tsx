
import React, { useEffect, useRef } from 'react';
import { User } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircleDot } from 'lucide-react';

interface UserMentionProps {
  users: User[];
  filter: string;
  onSelect: (user: User) => void;
  position: { top: number; left: number };
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const UserMention: React.FC<UserMentionProps> = ({ 
  users, 
  filter, 
  onSelect, 
  position, 
  inputRef 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        onSelect(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSelect, inputRef]);

  if (filteredUsers.length === 0) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg w-56 max-h-60 overflow-y-auto p-1"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px` 
      }}
    >
      {filteredUsers.map(user => (
        <div
          key={user.id}
          className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded cursor-pointer transition-colors"
          onClick={() => onSelect(user)}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{user.name}</div>
          </div>
          
          <div className="flex items-center">
            <CircleDot className={cn(
              "h-3 w-3",
              user.status === 'active' && "text-emerald-500",
              user.status === 'idle' && "text-amber-500",
              user.status === 'offline' && "text-slate-400"
            )} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserMention;
