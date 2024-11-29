# Book App Deployment Guide

## Project Overview
Book App is a web application utilizing the Google Books API to provide book search and information services.

## API Information
- **API Used**: Google Books API
- **Documentation**: [Google Books API Documentation](https://developers.google.com/books)
- **API Key**: Securely managed via environment variables

## Local Development Setup
1. Clone the repository
```bash
git clone [YOUR-REPOSITORY-URL]
```

2. Open `index.html` in a web browser
- Ensure you have a modern web browser
- No additional local server required

3. API Configuration
- Replace `YOUR_API_KEY` in `script.js` with a valid Google Books API key
- Obtain API key from [Google Cloud Console](https://console.cloud.google.com/)

## Prerequisites
- Git
- Nginx
- Two web servers (Web01, Web02)
- One load balancer server (Lb01)

## Server Setup
### Web Server Configuration
1. Navigate to web directory
```bash
cd /var/www/html
```
2. Copy project files
- `index.html`
- `style.css`
- `script.js`
- `placeholder.svg`
3. Restart Nginx
```bash
sudo systemctl restart nginx
```

## Load Balancer Configuration
1. Edit Nginx configuration (`/etc/nginx/nginx.conf`)
```nginx
http {
    upstream book-app-servers {
        server web-01.petersuccess.tech;
        server web-02.petersuccess.tech;
    }
    server {
        listen 80;
        location / {
            proxy_pass http://book-app-servers;
        }
    }
}
```
2. Test and Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Deployment Verification
1. Check individual server access
```bash
curl http://web-01.petersuccess.tech
curl http://web-02.petersuccess.tech
```
2. Verify load balancer
```bash
curl http://lb-01.petersuccess.tech
```

## Development Challenges & Solutions
1. **API Rate Limiting**
   - Challenge: Google Books API has request limits
   - Solution: Implemented caching mechanism to reduce API calls

2. **Cross-Origin Resource Sharing (CORS)**
   - Challenge: Restricted API access
   - Solution: Used proxy server to handle API requests

3. **Book Cover Placeholder**
   - Challenge: Some books lack cover images
   - Solution: Created custom SVG placeholder to display when book covers are unavailable

## Resources & Credits
- **Google Books API**: Primary data source
- **Icons**: [Feather Icons](https://feathericons.com/)
- **Font**: Google Fonts

## Troubleshooting
- Confirm Nginx running: `sudo systemctl status nginx`
- Check configuration: `sudo nginx -t`
- View logs: `sudo journalctl -u nginx`

## Server Information
- Web Server 1: web-01.petersuccess.tech
- Web Server 2: web-02.petersuccess.tech
- Load Balancer: lb-01.petersuccess.tech