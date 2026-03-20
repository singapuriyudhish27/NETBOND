# NETBOND Backend API Documentation

This document describes the backend API structure developed in the Next.js application.

## Project Structure

```
Frontend/netbond/src/
├── lib/
│   ├── db/
│   │   └── connection.js          # MongoDB connection handler
│   ├── models/                     # Mongoose models
│   │   ├── User/
│   │   │   ├── registerModel.js   # User registration model
│   │   │   └── loginModel.js       # Google OAuth user model
│   │   ├── Post/
│   │   │   └── postModel.js        # Post model
│   │   ├── Profile/
│   │   │   └── profileModel.js     # User profile model
│   │   ├── Follow/
│   │   │   └── followModel.js      # Follow relationship model
│   │   ├── Message/
│   │   │   └── messageModel.js     # Message model
│   │   └── Notification/
│   │       └── notificationModel.js # Notification model
│   ├── services/
│   │   └── authJWTUser.js          # JWT authentication service
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   └── utils/
│       └── api-helpers.js          # API helper functions
└── app/
    └── api/                        # Next.js API routes
        ├── register/               # User registration
        ├── login/                  # User authentication
        ├── posts/                  # Post CRUD operations
        ├── like/                   # Like/unlike posts
        ├── follow/                 # Follow/unfollow users
        ├── message/                # Messaging system
        ├── notification/           # Notifications
        ├── search/                 # Search functionality
        └── profile/                # Profile management
```

## Environment Variables

Create a `.env.local` file in the `Frontend/netbond` directory:

```env
MONGODB_URI=mongodb://localhost:27017/NETBOND
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/register`
- **Body**: `{ full_name, mobile_number, email_id, username, password }`
- **Response**: `{ message, user }`

#### Login
- **POST** `/api/login` or `/api/login/user`
- **Body**: `{ email_id, username, password }`
- **Response**: `{ message, user, hasProfile }`
- Sets HTTP-only cookie `uid` with JWT token

#### Logout
- **POST** `/api/login/logout`
- **Response**: `{ message }`
- Clears authentication cookie

#### Google OAuth Profile
- **GET** `/api/login?emails=<email>` - Get Google user profile
- **POST** `/api/login/profile` - Create Google user
- **PATCH** `/api/login/profile/[id]` - Update Google user

### Posts

#### Create Post
- **POST** `/api/posts/new`
- **Body**: FormData with `caption`, `tags`, `location`, `mediaType`, `media` (file)
- **Auth**: Required
- **Response**: `{ message, post }`

#### Edit Post
- **POST** `/api/posts/edit/[postId]`
- **Body**: `{ caption, tags, location }`
- **Auth**: Required (owner only)
- **Response**: `{ message, post }`

#### Delete Post
- **POST** `/api/posts/delete/[postId]`
- **Auth**: Required (owner only)
- **Response**: `{ message }`

### Likes

#### Toggle Like
- **POST** `/api/like/[postId]`
- **Auth**: Required
- **Response**: `{ success, liked, likesCount }`

### Follow System

#### Follow User
- **POST** `/api/follow/follow`
- **Body**: `{ followingId }`
- **Auth**: Required
- **Response**: `{ message, data }`

#### Unfollow User
- **POST** `/api/follow/unfollow`
- **Body**: `{ followingId }`
- **Auth**: Required
- **Response**: `{ message }`

#### Get Followers
- **GET** `/api/follow/followers/[userId]`
- **Response**: Array of follower objects

#### Get Following
- **GET** `/api/follow/following/[userId]`
- **Response**: Array of following objects

### Messages

#### Send Message
- **POST** `/api/message/send`
- **Body**: `{ receiverId, content }`
- **Auth**: Required
- **Response**: `{ message, data }`

#### Get Conversation
- **GET** `/api/message/conversation/[user1]/[user2]`
- **Response**: Array of messages

#### Get User Chats
- **GET** `/api/message/chats/[userId]`
- **Response**: Array of chat users

### Notifications

#### Create Notification
- **POST** `/api/notification/create`
- **Body**: `{ receiver, sender, type, post?, comment? }`
- **Response**: `{ message, notification }`

#### Get Notifications
- **GET** `/api/notification/[userId]`
- **Response**: Array of notifications

#### Mark as Read
- **PUT** `/api/notification/mark/[id]`
- **Response**: `{ message, notification }`

#### Delete Notification
- **DELETE** `/api/notification/delete/[id]`
- **Response**: `{ message }`

### Search

#### Search Users
- **POST** `/api/search`
- **Body**: `{ q: "search query" }`
- **Response**: `{ users }`

#### Get Profile by ID
- **GET** `/api/search/profile/[_id]`
- **Response**: `{ searchedProfile }`

### Profile

#### Create Profile
- **POST** `/api/profile`
- **Body**: FormData with profile fields
- **Response**: `{ message, profile }`

#### Get Profile
- **GET** `/api/profile`
- **Auth**: Required
- **Response**: `{ profile, posts }`

#### Update Profile
- **PATCH** `/api/profile/[userId]`
- **Body**: Profile update fields
- **Auth**: Required
- **Response**: Updated profile object

#### Delete Profile
- **DELETE** `/api/profile/[userId]`
- **Auth**: Required
- **Response**: `{ message }`

## Authentication

The API uses JWT tokens stored in HTTP-only cookies. The token is set on login and cleared on logout.

To authenticate requests, include the cookie in your requests. The middleware `getAuthFromRequest` extracts and validates the token.

## Database Models

### User (register)
- `full_name`, `mobile_number`, `email_id`, `username`, `password`
- `number_verified`, `email_verified`
- `loginTime`, `logoutTime`

### GoogleUser
- `id`, `displayName`, `familyName`, `givenName`, `emails`
- `verified`, `photos`, `provider`, `_json`, `accessToken`

### Post
- `author` (ref: Profile), `caption`, `media`, `likes[]`, `tags[]`, `location`
- `isEdited`, timestamps

### Profile
- `user` (ref: User), `username`, `full_name`, `bio`, `website`, `location`
- `gender`, `profile_picture`, `cover_photo`
- `posts[]`, `followers[]`, `following[]`
- `privacy` settings

### Follow
- `follower` (ref: User), `following` (ref: User)
- Timestamps

### Message
- `sender` (ref: Profile), `receiver` (ref: Profile)
- `messsage`, `timestamp`

### Notification
- `receiver` (ref: User), `sender` (ref: User)
- `type` (enum), `post` (ref: Post), `comment`
- `isRead`, timestamps

## Installation

1. Install dependencies:
```bash
cd Frontend/netbond
npm install
```

2. Set up environment variables (create `.env.local`)

3. Start the development server:
```bash
npm run dev
```

## Notes

- All API routes use Next.js 15 App Router format
- MongoDB connection is cached for performance
- File uploads are handled via FormData (implement proper storage in production)
- Authentication is handled via JWT in HTTP-only cookies
- All timestamps are automatically managed by Mongoose

