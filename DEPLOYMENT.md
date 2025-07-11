# Deployment Guide

This guide covers deploying the Life Insurance Recommendation MVP to cloud platforms.

## Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED

### Frontend Deployment on Vercel

1. **Prepare the Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
     ```
   - Deploy!

3. **Custom Domain (Optional)**
   - In your Vercel project settings, add a custom domain
   - Vercel will automatically provision SSL certificates

### Backend Deployment on Render

1. **Prepare the Backend**
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create a PostgreSQL Database**
   - In Render dashboard, click "New" → "PostgreSQL"
   - Choose a name (e.g., `insurance-db`)
   - Select the free plan
   - Note the connection details

4. **Deploy the Backend**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set the root directory to `backend`
   - Choose "Node" as the runtime
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=10000
     DATABASE_URL=postgresql://username:password@host:5432/database_name
     CORS_ORIGIN=https://your-frontend-url.vercel.app
     ```
   - Deploy!

5. **Update Frontend API URL**
   - Go back to Vercel
   - Update the `NEXT_PUBLIC_API_URL` environment variable with your Render backend URL
   - Redeploy the frontend

## Option 2: Both on Render

### Frontend on Render

1. **Create a Static Site**
   - In Render dashboard, click "New" → "Static Site"
   - Connect your GitHub repository
   - Set the root directory to `frontend`
   - Set build command: `npm install && npm run build`
   - Set publish directory: `out` (or `.next` for server-side rendering)
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
     ```
   - Deploy!

### Backend on Render (Same as Option 1)

Follow the backend deployment steps from Option 1.

## Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:5432/database_name
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Database Setup

### Render PostgreSQL
1. Create a PostgreSQL database in Render
2. Copy the connection string
3. Update the `DATABASE_URL` environment variable
4. The migration will run automatically on first deployment

### Manual Migration (if needed)
```bash
# Connect to your Render database
psql "postgresql://username:password@host:5432/database_name"

# Run the migration
\i backend/src/database/migrate.sql
```

## Testing Your Deployment

1. **Frontend**: Visit your Vercel/Render frontend URL
2. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health`
3. **API Test**: Use the form to submit a recommendation request

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly
   - Include the protocol (https://)

2. **Database Connection Issues**
   - Verify the `DATABASE_URL` is correct
   - Check if the database is accessible from your backend

3. **Build Failures**
   - Check the build logs in Render/Vercel
   - Ensure all dependencies are in package.json

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Redeploy after changing environment variables

### Logs and Monitoring

- **Vercel**: Check deployment logs in the Vercel dashboard
- **Render**: View logs in the Render dashboard under your service
- **Database**: Monitor database usage in Render dashboard

## Cost Comparison

### Vercel + Render (Recommended)
- **Vercel**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier includes 750 hours/month for web services
- **Total**: $0/month for moderate usage

### Both on Render
- **Render Static Site**: Free tier includes 100GB bandwidth/month
- **Render Web Service**: Free tier includes 750 hours/month
- **Total**: $0/month for moderate usage

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Only allow your frontend domain in CORS settings
3. **Database**: Use strong passwords for database connections
4. **HTTPS**: Both platforms provide automatic SSL certificates

## Next Steps

After deployment:
1. Test all functionality thoroughly
2. Set up monitoring and logging
3. Consider setting up a custom domain
4. Implement rate limiting for production use
5. Add authentication if needed 