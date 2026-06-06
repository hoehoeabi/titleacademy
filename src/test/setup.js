import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트가 종료된 후 자동으로 DOM을 정리합니다.
afterEach(() => {
  cleanup();
});
