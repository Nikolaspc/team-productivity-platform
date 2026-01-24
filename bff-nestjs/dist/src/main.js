"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    app.disable('x-powered-by');
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3001;
    const frontendUrl = configService.get('FRONTEND_URL');
    const cookieSecret = configService.get('COOKIE_SECRET');
    const nodeEnv = configService.get('NODE_ENV');
    app.setGlobalPrefix('api/v1');
    app.use((0, cookie_parser_1.default)(cookieSecret));
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter(configService));
    const reflector = app.get(core_1.Reflector);
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(reflector));
    if (nodeEnv !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Team Productivity Platform')
            .setDescription('BFF Enterprise API - German Market Standard')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'access-token')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
    if (nodeEnv !== 'production') {
        console.log(`📚 Documentation: http://localhost:${port}/api/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map