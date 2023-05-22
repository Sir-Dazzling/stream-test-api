import "dotenv/config";
import "reflect-metadata";
import server from "./server";

async function bootstrap() {
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

bootstrap().catch((error) => console.error(`Error thrown is ${error}`));
