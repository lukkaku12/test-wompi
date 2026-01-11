import { Controller, Get } from '@nestjs/common';

@Controller('checkout')
export class CheckoutController {
  @Get('health')
  health() {
    return { ok: true };
  }
}