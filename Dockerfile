
FROM node:22-slim AS frontend-build

RUN corepack enable
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /build
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm config set registry http://mirrors.cloud.tencent.com/npm/ && \
    pnpm install --frozen-lockfile

COPY frontend/ .

ARG VITE_SECRET=change-me-in-build-arg
ENV VITE_SECRET=$VITE_SECRET
RUN pnpm exec vite build


FROM node:22-slim AS runtime

# better-sqlite3 是原生 C++ 模块，需编译：装 node-gyp 依赖（python3 + make + g++）
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
# node-gyp 编译时会从 nodejs.org 下载 Node headers，改用国内镜像加速
ENV NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node

WORKDIR /app


COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./

RUN pnpm config set registry http://mirrors.cloud.tencent.com/npm/ && \
    pnpm install --frozen-lockfile


COPY backend/ .


COPY --from=frontend-build /build/dist ./static


VOLUME ["/app/data"]


ENV SERVER_PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]