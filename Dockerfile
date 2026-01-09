FROM node:20-slim

# Install python and ffmpeg (required for yt-dlp)
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Make local yt-dlp executable and move to path
RUN chmod +x ./yt-dlp && mv ./yt-dlp /usr/local/bin/yt-dlp

# Verify installations
RUN yt-dlp --version && ffmpeg -version

RUN mkdir -p temp

EXPOSE 3000

CMD ["npm", "start"]
