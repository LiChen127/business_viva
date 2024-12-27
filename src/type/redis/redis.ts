// 定义redis的key的形式统一

type RedisKey = {
  prefix: string;
  key: string;
}


type RedisValue = {
  value: string;
  expire: number;
}
