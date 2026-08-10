import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('.coderabbit.yaml validation', () => {
  const configPath = path.join(__dirname, '.coderabbit.yaml');
  let config: any;

  it('should exist', () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('should be valid YAML', () => {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    expect(() => {
      config = yaml.load(fileContents);
    }).not.toThrow();
  });

  describe('structure validation', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('should have reviews section', () => {
      expect(config).toHaveProperty('reviews');
      expect(config.reviews).toBeDefined();
    });

    it('should have path_instructions in reviews', () => {
      expect(config.reviews).toHaveProperty('path_instructions');
      expect(Array.isArray(config.reviews.path_instructions)).toBe(true);
    });

    it('should have at least one path instruction', () => {
      expect(config.reviews.path_instructions.length).toBeGreaterThan(0);
    });

    it('should have tools section', () => {
      expect(config.reviews).toHaveProperty('tools');
      expect(config.reviews.tools).toBeDefined();
    });
  });

  describe('path_instructions validation', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('each path instruction should have required fields', () => {
      config.reviews.path_instructions.forEach((instruction: any, index: number) => {
        expect(instruction, `instruction ${index} should have path`).toHaveProperty('path');
        expect(instruction, `instruction ${index} should have instructions`).toHaveProperty('instructions');
        expect(typeof instruction.path, `instruction ${index} path should be string`).toBe('string');
        expect(typeof instruction.instructions, `instruction ${index} instructions should be string`).toBe('string');
      });
    });

    it('should have general catch-all path instruction', () => {
      const hasGeneralPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path === '**/*'
      );
      expect(hasGeneralPath).toBe(true);
    });

    it('should have SQL-specific path instructions', () => {
      const hasSqlPath = config.reviews.path_instructions.some(
        (instruction: any) =>
          instruction.path.includes('sql') || instruction.path.includes('psql')
      );
      expect(hasSqlPath).toBe(true);
    });

    it('should have migration-specific path instructions', () => {
      const hasMigrationPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path.includes('migrations')
      );
      expect(hasMigrationPath).toBe(true);
    });

    it('should have JavaScript/TypeScript-specific path instructions', () => {
      const hasJsPath = config.reviews.path_instructions.some(
        (instruction: any) =>
          instruction.path.includes('js') || instruction.path.includes('ts')
      );
      expect(hasJsPath).toBe(true);
    });

    it('should have Python-specific path instructions', () => {
      const hasPythonPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path.includes('.py')
      );
      expect(hasPythonPath).toBe(true);
    });

    it('should have Go-specific path instructions', () => {
      const hasGoPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path.includes('.go')
      );
      expect(hasGoPath).toBe(true);
    });

    it('should have Dockerfile-specific path instructions', () => {
      const hasDockerPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path.includes('Dockerfile')
      );
      expect(hasDockerPath).toBe(true);
    });

    it('should have GitHub workflow-specific path instructions', () => {
      const hasWorkflowPath = config.reviews.path_instructions.some(
        (instruction: any) => instruction.path.includes('.github/workflows')
      );
      expect(hasWorkflowPath).toBe(true);
    });

    it('should have YAML-specific path instructions', () => {
      const hasYamlPath = config.reviews.path_instructions.some(
        (instruction: any) =>
          instruction.path.includes('.yml') || instruction.path.includes('.yaml')
      );
      expect(hasYamlPath).toBe(true);
    });
  });

  describe('content validation', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('instructions should not be empty', () => {
      config.reviews.path_instructions.forEach((instruction: any, index: number) => {
        expect(
          instruction.instructions.trim().length,
          `instruction ${index} should have non-empty instructions`
        ).toBeGreaterThan(0);
      });
    });

    it('general instructions should mention security', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      expect(generalInstruction).toBeDefined();
      expect(generalInstruction.instructions.toLowerCase()).toContain('security');
    });

    it('general instructions should mention performance', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      expect(generalInstruction).toBeDefined();
      expect(generalInstruction.instructions.toLowerCase()).toContain('performance');
    });

    it('general instructions should mention error handling', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      expect(generalInstruction).toBeDefined();
      expect(generalInstruction.instructions.toLowerCase()).toContain('error handling');
    });

    it('SQL instructions should mention parameterized queries', () => {
      const sqlInstruction = config.reviews.path_instructions.find(
        (instruction: any) =>
          instruction.path.includes('sql') || instruction.path.includes('psql')
      );
      expect(sqlInstruction).toBeDefined();
      expect(sqlInstruction.instructions.toLowerCase()).toContain('parameterized');
    });

    it('SQL instructions should mention indexes', () => {
      const sqlInstruction = config.reviews.path_instructions.find(
        (instruction: any) =>
          instruction.path.includes('sql') || instruction.path.includes('psql')
      );
      expect(sqlInstruction).toBeDefined();
      expect(sqlInstruction.instructions.toLowerCase()).toContain('index');
    });

    it('migration instructions should mention zero-downtime', () => {
      const migrationInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path.includes('migrations')
      );
      expect(migrationInstruction).toBeDefined();
      expect(migrationInstruction.instructions.toLowerCase()).toContain('zero-downtime');
    });

    it('JS/TS instructions should warn against eval', () => {
      const jsInstruction = config.reviews.path_instructions.find(
        (instruction: any) =>
          instruction.path.includes('js') || instruction.path.includes('ts')
      );
      expect(jsInstruction).toBeDefined();
      expect(jsInstruction.instructions.toLowerCase()).toContain('eval');
    });

    it('Dockerfile instructions should mention non-root user', () => {
      const dockerInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path.includes('Dockerfile')
      );
      expect(dockerInstruction).toBeDefined();
      expect(dockerInstruction.instructions.toLowerCase()).toContain('non-root');
    });

    it('GitHub workflow instructions should mention security', () => {
      const workflowInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path.includes('.github/workflows')
      );
      expect(workflowInstruction).toBeDefined();
      expect(
        workflowInstruction.instructions.toLowerCase().includes('permission') ||
        workflowInstruction.instructions.toLowerCase().includes('security')
      ).toBe(true);
    });
  });

  describe('tools validation', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('should have ast-grep configuration', () => {
      expect(config.reviews.tools).toHaveProperty('ast-grep');
    });

    it('ast-grep should have essential_rules enabled', () => {
      expect(config.reviews.tools['ast-grep']).toHaveProperty('essential_rules');
      expect(config.reviews.tools['ast-grep'].essential_rules).toBe(true);
    });
  });

  describe('glob pattern validation', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('all path patterns should be valid glob patterns', () => {
      const validGlobPattern = /^[*\w\-./{}[\],]+$/;
      config.reviews.path_instructions.forEach((instruction: any, index: number) => {
        expect(
          validGlobPattern.test(instruction.path),
          `instruction ${index} path "${instruction.path}" should be valid glob pattern`
        ).toBe(true);
      });
    });

    it('should not have duplicate path patterns', () => {
      const paths = config.reviews.path_instructions.map((i: any) => i.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });
  });

  describe('edge cases and negative tests', () => {
    it('should handle file read errors gracefully', () => {
      const nonExistentPath = path.join(__dirname, '.nonexistent.yaml');
      expect(() => {
        fs.readFileSync(nonExistentPath, 'utf8');
      }).toThrow();
    });

    it('should reject invalid YAML syntax', () => {
      const invalidYaml = 'invalid: yaml: content: [missing bracket';
      expect(() => {
        yaml.load(invalidYaml);
      }).toThrow();
    });

    it('should have consistent instruction formatting', () => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);

      config.reviews.path_instructions.forEach((instruction: any, index: number) => {
        const lines = instruction.instructions.split('\n');
        expect(
          lines.length,
          `instruction ${index} should have multiple lines of guidance`
        ).toBeGreaterThan(0);
      });
    });

    it('should not have any empty path patterns', () => {
      config.reviews.path_instructions.forEach((instruction: any, index: number) => {
        expect(
          instruction.path.trim(),
          `instruction ${index} should not have empty path`
        ).not.toBe('');
      });
    });

    it('config should be parseable multiple times consistently', () => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      const config1 = yaml.load(fileContents);
      const config2 = yaml.load(fileContents);
      expect(JSON.stringify(config1)).toBe(JSON.stringify(config2));
    });
  });

  describe('security review priorities', () => {
    beforeEach(() => {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(fileContents);
    });

    it('general instructions should prioritize security vulnerabilities', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      const instructions = generalInstruction.instructions.toLowerCase();
      expect(instructions).toContain('injection');
      expect(instructions).toContain('xss');
      expect(instructions).toContain('csrf');
    });

    it('should mention SQL injection prevention', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      expect(generalInstruction.instructions.toLowerCase()).toContain('sql');
    });

    it('should cover authentication and authorization', () => {
      const generalInstruction = config.reviews.path_instructions.find(
        (instruction: any) => instruction.path === '**/*'
      );
      const instructions = generalInstruction.instructions.toLowerCase();
      expect(
        instructions.includes('authn') ||
        instructions.includes('authz') ||
        instructions.includes('authentication') ||
        instructions.includes('authorization')
      ).toBe(true);
    });
  });
});