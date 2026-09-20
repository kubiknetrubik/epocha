import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';
import { ArchaismDicts } from './archaism_dict.entity';

@Entity('dict_likes')
export class DictLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  dictId: number;

  @ManyToOne(() => Users, (user) => user.likes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => ArchaismDicts, (dict) => dict.likes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'dictId' })
  dict: ArchaismDicts;
}