import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ArchaismDicts } from './archaism_dict.entity';
import { DictLikes } from './dict_like.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  username: string;

  @OneToMany(() => ArchaismDicts, (dict) => dict.user)
  dicts: ArchaismDicts[];

  @OneToMany(() => DictLikes, (like) => like.user)
  likes: DictLikes[];
}