FROM node:18-slim

# Install basic dependencies (and libatomic1 just in case, though usually not needed for basic node apps)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port (Railway sets PORT env var, but good to document)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
