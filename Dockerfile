FROM node:fermium-alpine
ENV NODE_ENV=production
ENV TERM=xterm
RUN apk add --no-cache --virtual .gyp \
        build-base \
        python \
    && apk del .gyp
RUN mkdir -p /home/node
WORKDIR /home/node
COPY api/package*.json /home/node/
RUN npm install --only=production
RUN chown -R root:root /home/node
COPY api/lib/src /home/node/lib
COPY app/dist /home/node/app
RUN mkdir -p /home/db
COPY db/chronolog.db /home/db/
RUN chown -R node:node /home/db
USER node
EXPOSE 8888
CMD ["node","lib/index.js"]
