FROM node:24-alpine
ENV NODE_ENV=production
ENV TERM=xterm
RUN mkdir -p /home/node
WORKDIR /home/node
COPY api/package*.json /home/node/
RUN npm ci --omit=dev
COPY api/lib/src /home/node/lib
COPY app/dist /home/node/app
RUN mkdir -p /home/db
COPY db/empty.db /home/db/chronolog.db
RUN chown -R node:node /home/db && chown -R root:root /home/node
USER node
EXPOSE 5404
CMD ["node","lib/index.js"]
