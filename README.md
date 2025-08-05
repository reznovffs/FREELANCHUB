# FreelanceHub - Job Board & Marketplace

A full-stack job board and freelancer marketplace built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JavaScript. This is a small-scale Upwork clone that allows clients to post jobs and freelancers to apply for them.

## 🚀 Features

### Core Features
- **User Authentication**: Register, login, and profile management
- **Role-based Access**: Separate interfaces for clients and freelancers
- **Job Posting**: Clients can post detailed job listings
- **Job Applications**: Freelancers can apply with proposals and bids
- **Search & Filtering**: Advanced job search with category and experience filters
- **Admin Panel**: Manage users, jobs, and platform statistics
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### User Roles
- **Clients**: Can post jobs, review applications, and hire freelancers
- **Freelancers**: Can browse jobs, submit applications, and manage proposals
- **Admins**: Can manage all users and jobs, view platform statistics

### Job Features
- Detailed job descriptions with budget and timeline
- Multiple categories (Web Development, Design, Writing, etc.)
- Experience level requirements
- Skills matching
- Application tracking
- Status management (open, in-progress, completed)

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern design
- **Vanilla JavaScript** - Interactivity
- **Font Awesome** - Icons
- **Responsive Design** - Mobile-first approach

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-board-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/job-board
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud service like MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (client/freelancer/admin),
  profile: {
    bio: String,
    skills: [String],
    hourlyRate: Number,
    experience: String,
    portfolio: String
  },
  isVerified: Boolean,
  createdAt: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  client: ObjectId (ref: User),
  category: String,
  skills: [String],
  budget: {
    type: String (fixed/hourly),
    amount: Number,
    minAmount: Number,
    maxAmount: Number
  },
  duration: String,
  experience: String (entry/intermediate/expert),
  status: String (open/in-progress/completed/cancelled),
  applications: [{
    freelancer: ObjectId (ref: User),
    proposal: String,
    bidAmount: Number,
    estimatedDuration: String,
    appliedAt: Date,
    status: String (pending/accepted/rejected)
  }],
  hiredFreelancer: ObjectId (ref: User),
  createdAt: Date,
  deadline: Date,
  isActive: Boolean
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (clients only)
- `PUT /api/jobs/:id` - Update job (owner only)
- `DELETE /api/jobs/:id` - Delete job (owner only)
- `POST /api/jobs/:id/apply` - Apply for job (freelancers only)
- `PUT /api/jobs/:id/applications/:applicationId` - Accept/reject application

### Applications
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/my-jobs-applications` - Get applications for user's jobs
- `DELETE /api/applications/withdraw/:jobId` - Withdraw application

### Admin
- `GET /api/admin/dashboard` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/jobs` - Get all jobs (admin view)
- `PUT /api/admin/jobs/:id` - Update job status
- `DELETE /api/admin/jobs/:id` - Delete job

## 🎨 UI Features

### Design Highlights
- **Modern UI**: Clean, professional design with smooth animations
- **Responsive Layout**: Works seamlessly across all devices
- **Interactive Elements**: Hover effects, transitions, and feedback
- **Modal System**: Clean modal dialogs for forms and details
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages

### Key Components
- **Navigation Bar**: Fixed header with user menu
- **Hero Section**: Eye-catching landing page
- **Job Cards**: Attractive job listings with hover effects
- **Search & Filters**: Advanced filtering system
- **Forms**: Clean, validated input forms
- **Modals**: Responsive modal dialogs

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with tokens
- **Input Validation**: Server-side validation with express-validator
- **Role-based Access**: Middleware for route protection
- **CORS Protection**: Cross-origin request handling
- **Error Handling**: Comprehensive error management

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Set up MongoDB Atlas or similar cloud database
4. Configure reverse proxy (nginx)
5. Set up SSL certificate

### Environment Variables for Production
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-board
JWT_SECRET=very-long-random-secret-key
NODE_ENV=production
```

## 📱 Usage Guide

### For Clients
1. Register as a client
2. Post job listings with detailed requirements
3. Review applications from freelancers
4. Accept or reject proposals
5. Manage ongoing projects

### For Freelancers
1. Register as a freelancer
2. Browse available jobs
3. Submit detailed proposals
4. Track application status
5. Manage your profile and skills

### For Admins
1. Access admin panel
2. View platform statistics
3. Manage users and jobs
4. Monitor system health

## 🔄 Future Enhancements

### Planned Features
- **Real-time Chat**: Messaging between clients and freelancers
- **File Upload**: Portfolio and project file sharing
- **Payment Integration**: Stripe/PayPal integration
- **Rating System**: User reviews and ratings
- **Advanced Search**: Elasticsearch integration
- **Email Notifications**: Automated email alerts
- **Mobile App**: React Native mobile application
- **Video Calls**: Integration with WebRTC
- **Escrow System**: Secure payment escrow
- **Dispute Resolution**: Built-in conflict resolution

### Technical Improvements
- **React Frontend**: Migrate to React with TypeScript
- **Tailwind CSS**: Modern utility-first CSS framework
- **GraphQL**: API optimization with GraphQL
- **Redis Caching**: Performance optimization
- **Docker**: Containerization for easy deployment
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Font Awesome for icons
- MongoDB for the database
- Express.js community for the framework
- All contributors and users

---

**Happy coding! 🚀** 