# 使用 alpine 版本的 node
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 包管理器
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖
RUN pnpm install

# 复制代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pnpm", "run", "start"]
