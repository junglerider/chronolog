FROM node:24-alpine
ENV NODE_ENV=production
ENV TERM=xterm
WORKDIR /home/node
COPY api/package*.json /home/node/
RUN npm ci --omit=dev
COPY api/lib/src /home/node/lib
COPY app/dist /home/node/app
COPY db/chronolog.db /home/db/chronolog.db
RUN chown -R node:node /home/db
USER node
EXPOSE 5404
CMD ["node","lib/index.js"]
