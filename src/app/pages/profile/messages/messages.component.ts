import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable, of } from 'rxjs';

// Mock interfaces - replace with your actual models
interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  listingTitle?: string;
  listingId?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex">
      <!-- Conversations List -->
      <div class="w-80 border-r border-gray-200 flex flex-col bg-white">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Messages</h2>

          <!-- Search -->
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterConversations()"
              placeholder="Search conversations..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Conversations -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoadingConversations" class="p-6">
            <div class="space-y-4">
              <div *ngFor="let i of [1,2,3,4,5]" class="animate-pulse flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoadingConversations && filteredConversations.length === 0" class="p-6 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-gray-500">No conversations found</p>
          </div>

          <div *ngFor="let conversation of filteredConversations; trackBy: trackByConversationId"
               class="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
               [class.bg-blue-50]="selectedConversation?.id === conversation.id"
               (click)="selectConversation(conversation)">

            <div class="p-4 flex items-start space-x-3">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                  <div class="w-full h-full rounded-full border-2 border-white relative overflow-hidden">
                    <img
                      *ngIf="getOtherParticipant(conversation)?.profilePicUrl; else initials"
                      [src]="getOtherParticipant(conversation)?.profilePicUrl"
                      [alt]="getOtherParticipant(conversation)?.firstName + ' ' + getOtherParticipant(conversation)?.lastName"
                      class="w-full h-full object-cover"
                    />
                    <ng-template #initials>
                      <div class="w-full h-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {{ getInitials(getOtherParticipant(conversation)) }}
                      </div>
                    </ng-template>
                  </div>
                </div>

                <!-- Online indicator -->
                <div *ngIf="getOtherParticipant(conversation)?.isOnline"
                     class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-sm font-semibold text-gray-900 truncate">
                    {{ getOtherParticipant(conversation)?.firstName }} {{ getOtherParticipant(conversation)?.lastName }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <span *ngIf="conversation.unreadCount > 0"
                          class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[20px] h-5">
                      {{ conversation.unreadCount }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatMessageTime(conversation.updatedAt) }}
                    </span>
                  </div>
                </div>

                <!-- Listing info if available -->
                <div *ngIf="conversation.listingTitle" class="text-xs text-blue-600 mb-1 truncate">
                  Re: {{ conversation.listingTitle }}
                </div>

                <!-- Last message preview -->
                <p class="text-sm text-gray-600 truncate" [class.font-semibold]="conversation.unreadCount > 0">
                  {{ conversation.lastMessage?.content || 'No messages yet' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- No conversation selected -->
        <div *ngIf="!selectedConversation" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p class="text-gray-600">Choose from your existing conversations or start a new one</p>
          </div>
        </div>

        <!-- Chat interface when conversation is selected -->
        <div *ngIf="selectedConversation" class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <!-- Mobile back button -->
                <button class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" (click)="selectedConversation = null">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>

                <!-- User avatar and info -->
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                  <div class="w-full h-full rounded-full border-2 border-white relative overflow-hidden">
                    <img
                      *ngIf="getOtherParticipant(selectedConversation)?.profilePicUrl; else headerInitials"
                      [src]="getOtherParticipant(selectedConversation)?.profilePicUrl"
                      [alt]="getOtherParticipant(selectedConversation)?.firstName + ' ' + getOtherParticipant(selectedConversation)?.lastName"
                      class="w-full h-full object-cover"
                    />
                    <ng-template #headerInitials>
                      <div class="w-full h-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {{ getInitials(getOtherParticipant(selectedConversation)) }}
                      </div>
                    </ng-template>
                  </div>
                </div>

                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ getOtherParticipant(selectedConversation)?.firstName }} {{ getOtherParticipant(selectedConversation)?.lastName }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    <span *ngIf="getOtherParticipant(selectedConversation)?.isOnline; else lastSeen">Online now</span>
                    <ng-template #lastSeen>
                      <span *ngIf="getOtherParticipant(selectedConversation)?.lastSeen">
                        Last seen {{ formatLastSeen(getOtherParticipant(selectedConversation)?.lastSeen!) }}
                      </span>
                      <span *ngIf="!getOtherParticipant(selectedConversation)?.lastSeen">Offline</span>
                    </ng-template>
                  </p>
                </div>
              </div>

              <!-- Chat actions -->
              <div class="flex items-center space-x-2">
                <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Archive conversation">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6m0 0l6-6m-6 6V3m-7 7a9 9 0 1018 0 9 9 0 00-18 0z"></path>
                  </svg>
                </button>
                <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="More options">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Listing info banner if applicable -->
            <div *ngIf="selectedConversation.listingTitle" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span class="text-sm font-medium text-blue-900">{{ selectedConversation.listingTitle }}</span>
                <button class="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium">View Listing</button>
              </div>
            </div>
          </div>

          <!-- Messages Container -->
          <div #messagesContainer class="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
            <!-- Loading messages -->
            <div *ngIf="isLoadingMessages" class="space-y-4">
              <div *ngFor="let i of [1,2,3,4,5]" class="animate-pulse"
                   [class]="i % 2 === 0 ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="i % 2 === 0 ? 'bg-blue-200 rounded-2xl p-4 max-w-xs' : 'bg-gray-200 rounded-2xl p-4 max-w-xs'">
                  <div class="h-4 bg-current opacity-30 rounded w-24 mb-2"></div>
                  <div class="h-3 bg-current opacity-30 rounded w-16"></div>
                </div>
              </div>
            </div>

            <!-- Actual messages -->
            <div *ngFor="let message of messages; trackBy: trackByMessageId"
                 class="flex"
                 [class]="isOwnMessage(message) ? 'justify-end' : 'justify-start'">

              <div class="flex max-w-xs lg:max-w-md space-x-2"
                   [class]="isOwnMessage(message) ? 'flex-row-reverse space-x-reverse' : ''">

                <!-- Avatar for received messages -->
                <div *ngIf="!isOwnMessage(message)" class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 flex-shrink-0">
                  <div class="w-full h-full rounded-full border border-white relative overflow-hidden">
                    <img
                      *ngIf="getMessageSender(message)?.profilePicUrl; else messageInitials"
                      [src]="getMessageSender(message)?.profilePicUrl"
                      [alt]="getMessageSender(message)?.firstName"
                      class="w-full h-full object-cover"
                    />
                    <ng-template #messageInitials>
                      <div class="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {{ getInitials(getMessageSender(message)) }}
                      </div>
                    </ng-template>
                  </div>
                </div>

                <!-- Message content -->
                <div class="flex flex-col">
                  <div class="px-4 py-2 rounded-2xl"
                       [class]="isOwnMessage(message)
                         ? 'bg-blue-600 text-white rounded-br-md'
                         : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'">

                    <!-- Text message -->
                    <p *ngIf="message.type === 'text'" class="text-sm whitespace-pre-wrap break-words">{{ message.content }}</p>

                    <!-- File attachment -->
                    <div *ngIf="message.type === 'file'" class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                      <span class="text-sm">{{ message.attachmentName }}</span>
                    </div>

                    <!-- Image attachment -->
                    <div *ngIf="message.type === 'image'">
                      <img [src]="message.attachmentUrl" [alt]="message.content" class="max-w-full h-auto rounded-lg">
                      <p *ngIf="message.content" class="text-sm mt-2">{{ message.content }}</p>
                    </div>
                  </div>

                  <!-- Message timestamp -->
                  <div class="flex items-center mt-1 space-x-2"
                       [class]="isOwnMessage(message) ? 'justify-end' : 'justify-start'">
                    <span class="text-xs text-gray-500">{{ formatMessageTime(message.timestamp) }}</span>
                    <div *ngIf="isOwnMessage(message)" class="flex items-center space-x-1">
                      <svg *ngIf="message.isRead" class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <svg *ngIf="!message.isRead" class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 border-t border-gray-200 bg-white">
            <form (ngSubmit)="sendMessage()" class="flex items-end space-x-3">
              <!-- Attachment button -->
              <button type="button" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Attach file">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>

              <!-- Message input -->
              <div class="flex-1 relative">
                <textarea
                  [(ngModel)]="newMessage"
                  name="message"
                  placeholder="Type your message..."
                  rows="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32"
                  (keydown)="onMessageKeyDown($event)"
                  [disabled]="isSending"
                  #messageInput
                ></textarea>
              </div>

              <!-- Send button -->
              <button
                type="submit"
                class="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                [disabled]="!newMessage.trim() || isSending"
              >
                <div *ngIf="isSending" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <svg *ngIf="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  searchTerm = '';

  isLoadingConversations = false;
  isLoadingMessages = false;
  isSending = false;

  currentUserId = 'current-user-id'; // Replace with actual current user ID

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadConversations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversations() {
    this.isLoadingConversations = true;

    // Mock API call - replace with actual service
    setTimeout(() => {
      this.conversations = this.getMockConversations();
      this.filteredConversations = [...this.conversations];
      this.isLoadingConversations = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);

    // Mark messages as read
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      // Call API to mark as read
    }
  }

  loadMessages(conversationId: string) {
    this.isLoadingMessages = true;
    this.messages = [];

    // Mock API call - replace with actual service
    setTimeout(() => {
      this.messages = this.getMockMessages(conversationId);
      this.isLoadingMessages = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
    }, 500);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    this.isSending = true;

    const message: Message = {
      id: Date.now().toString(),
      senderId: this.currentUserId,
      receiverId: this.getOtherParticipant(this.selectedConversation)!.id,
      content: this.newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    };

    // Optimistic update
    this.messages.push(message);

    // Update conversation last message
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = message;
      this.selectedConversation.updatedAt = new Date();
    }

    this.newMessage = '';
    this.scrollToBottom();

    // Mock API call - replace with actual service
    setTimeout(() => {
      this.isSending = false;
      // Update message with server response if needed
    }, 500);
  }

  onMessageKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  filterConversations() {
    if (!this.searchTerm.trim()) {
      this.filteredConversations = [...this.conversations];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredConversations = this.conversations.filter(conversation => {
      const otherUser = this.getOtherParticipant(conversation);
      const fullName = `${otherUser?.firstName} ${otherUser?.lastName}`.toLowerCase();
      const listingTitle = conversation.listingTitle?.toLowerCase() || '';
      const lastMessage = conversation.lastMessage?.content.toLowerCase() || '';

      return fullName.includes(term) ||
             listingTitle.includes(term) ||
             lastMessage.includes(term);
    });
  }

  getOtherParticipant(conversation: Conversation): User | null {
    return conversation.participants.find(p => p.id !== this.currentUserId) || null;
  }

  getMessageSender(message: Message): User | null {
    if (!this.selectedConversation) return null;
    return this.selectedConversation.participants.find(p => p.id === message.senderId) || null;
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getInitials(user: User | null): string {
    if (!user) return '?';
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return messageDate.toLocaleDateString();
  }

  formatLastSeen(lastSeen: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (diffInMinutes < 5) return 'a few minutes ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    return lastSeen.toLocaleDateString();
  }

  trackByConversationId(index: number, conversation: Conversation): string {
    return conversation.id;
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  // Mock data methods - replace with actual API calls
  private getMockConversations(): Conversation[] {
    return [
      {
        id: '1',
        participants: [
          { id: this.currentUserId, firstName: 'You', lastName: '' },
          { id: '2', firstName: 'John', lastName: 'Doe', profilePicUrl: '', isOnline: true }
        ],
        lastMessage: {
          id: '1',
          senderId: '2',
          receiverId: this.currentUserId,
          content: 'Hi! Is the camera still available for rent this weekend?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          type: 'text'
        },
        unreadCount: 2,
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        listingTitle: 'Canon EOS R5 Camera with 24-70mm Lens',
        listingId: 'listing-1'
      },
      {
        id: '2',
        participants: [
          { id: this.currentUserId, firstName: 'You', lastName: '' },
          { id: '3', firstName: 'Sarah', lastName: 'Johnson', profilePicUrl: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) }
        ],
        lastMessage: {
          id: '2',
          senderId: this.currentUserId,
          receiverId: '3',
          content: 'Great! I\'ll have it ready for pickup tomorrow morning.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isRead: true,
          type: 'text'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        listingTitle: 'Professional Lighting Kit',
        listingId: 'listing-2'
      },
      {
        id: '3',
        participants: [
          { id: this.currentUserId, firstName: 'You', lastName: '' },
          { id: '4', firstName: 'Mike', lastName: 'Chen', profilePicUrl: '', isOnline: true }
        ],
        lastMessage: {
          id: '3',
          senderId: '4',
          receiverId: this.currentUserId,
          content: 'Thanks for the quick response!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isRead: true,
          type: 'text'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: '4',
        participants: [
          { id: this.currentUserId, firstName: 'You', lastName: '' },
          { id: '5', firstName: 'Emily', lastName: 'Rodriguez', profilePicUrl: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12) }
        ],
        lastMessage: {
          id: '4',
          senderId: '5',
          receiverId: this.currentUserId,
          content: 'Could you send me some photos of the equipment condition?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          isRead: false,
          type: 'text'
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        listingTitle: 'DJI Mavic Air 2 Drone',
        listingId: 'listing-3'
      },
      {
        id: '5',
        participants: [
          { id: this.currentUserId, firstName: 'You', lastName: '' },
          { id: '6', firstName: 'Alex', lastName: 'Thompson', profilePicUrl: '', isOnline: false }
        ],
        lastMessage: {
          id: '5',
          senderId: this.currentUserId,
          receiverId: '6',
          content: 'No problem! Let me know if you need anything else.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
          isRead: true,
          type: 'text'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72)
      }
    ];
  }

  private getMockMessages(conversationId: string): Message[] {
    const messagesByConversation: { [key: string]: Message[] } = {
      '1': [
        {
          id: 'm1',
          senderId: '2',
          receiverId: this.currentUserId,
          content: 'Hello! I saw your listing for the Canon EOS R5. Is it still available?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          senderId: this.currentUserId,
          receiverId: '2',
          content: 'Hi John! Yes, it\'s still available. What dates were you looking to rent it?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          senderId: '2',
          receiverId: this.currentUserId,
          content: 'I need it for a wedding shoot this weekend. Saturday and Sunday would be perfect.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm4',
          senderId: this.currentUserId,
          receiverId: '2',
          content: 'That works perfectly! The camera comes with the 24-70mm lens, battery grip, and two extra batteries. Rental rate is $150/day.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm5',
          senderId: '2',
          receiverId: this.currentUserId,
          content: 'Sounds great! Can I pick it up Friday evening?',
          timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
          isRead: false,
          type: 'text'
        },
        {
          id: 'm6',
          senderId: '2',
          receiverId: this.currentUserId,
          content: 'Hi! Is the camera still available for rent this weekend?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          type: 'text'
        }
      ],
      '2': [
        {
          id: 'm7',
          senderId: '3',
          receiverId: this.currentUserId,
          content: 'Hi! I\'m interested in renting your lighting kit for a photo shoot next week.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm8',
          senderId: this.currentUserId,
          receiverId: '3',
          content: 'Hello Sarah! The lighting kit includes 3 softbox lights, stands, and all cables. When do you need it?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7), // 7 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm9',
          senderId: '3',
          receiverId: this.currentUserId,
          content: 'Perfect! I need it for Tuesday through Thursday. What\'s the daily rate?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm10',
          senderId: this.currentUserId,
          receiverId: '3',
          content: 'The rate is $80 per day, so $240 total for 3 days. I can have everything ready for pickup Monday evening.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'm11',
          senderId: this.currentUserId,
          receiverId: '3',
          content: 'Great! I\'ll have it ready for pickup tomorrow morning.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isRead: true,
          type: 'text'
        }
      ]
    };

    return messagesByConversation[conversationId] || [];
  }
}
