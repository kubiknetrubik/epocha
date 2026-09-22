import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from './user.entity';
import { DictLikes } from './dict_like.entity';

export enum DictStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DELETED = 'deleted',
}

@Entity('archaism_dicts')
export class ArchaismDicts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string;

  @Column({ type: 'date', nullable: true})
  startDate: string | null;

  @Column({ type: 'date', nullable: true})
  endDate: string | null;

  @Column({ type: 'varchar', length: 20, default: DictStatus.DRAFT })
  status: DictStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => Users, (user) => user.dicts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => DictLikes, (like) => like.dict)
  likes: DictLikes[];
}