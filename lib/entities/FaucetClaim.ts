import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("faucet_claims")
export class FaucetClaim {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 42 })
  to_wallet_address!: string;

  @Column({ type: "varchar", length: 42 })
  from_wallet_address!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  tweet_id!: string;

  @Column({ type: "varchar", length: 255 })
  tweet_account!: string;

  @Column({ type: "decimal", precision: 18, scale: 8 })
  amount!: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address!: string;

  @CreateDateColumn({ type: "timestamp" })
  time_stamp!: Date;
}
