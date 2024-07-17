# how-are-you-be

## Before running it

1. how-are-you-be는 NodeJS를 런타임으로, pnpm을 패키지 매니저로 사용하고 있습니다. 상세 버전은 아래와 같아요.

```text
pnpm: 9.0.4
node: 20.11.0
```

2. how-are-you는 docker-compose를 사용하여 개발 환경에서 데이터베이스를 유동적으로 사용할 수 있도록 합니다. 실행하기 전 Docker desktop을 반드시 실행해주시고 아래 커멘드를 입력해주세요.

```bash
docker compose -f ./docker-compose.dev.yml up -d
```
