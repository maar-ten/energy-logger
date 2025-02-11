FROM node:18 AS build-env
COPY . /app
WORKDIR /app

RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs18-debian12
COPY --from=build-env /app /app
WORKDIR /app
CMD ["index.js"]