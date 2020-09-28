import {MigrationInterface, QueryRunner} from 'typeorm';

export class eventListIsHiddenAttr1601297968526 implements MigrationInterface {
  name = 'eventListIsHiddenAttr1601297968526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_list" ADD "isHidden" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_list" DROP COLUMN "isHidden"`, undefined);
  }

}
