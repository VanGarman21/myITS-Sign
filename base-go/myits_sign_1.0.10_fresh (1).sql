/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     20/03/2025 15:56:25                          */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('anggota_tandatangan') and o.name = 'FK_ANGGOTA__ANGGOTA_P_SDM')
alter table anggota_tandatangan
   drop constraint FK_ANGGOTA__ANGGOTA_P_SDM
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('anggota_tandatangan') and o.name = 'FK_ANGGOTA__PENANDATA_PENANDAT')
alter table anggota_tandatangan
   drop constraint FK_ANGGOTA__PENANDATA_PENANDAT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('dokumen') and o.name = 'FK_DOKUMEN_DOKUMEN_P_PENANDAT')
alter table dokumen
   drop constraint FK_DOKUMEN_DOKUMEN_P_PENANDAT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('penandatanganan') and o.name = 'FK_PENANDAT_PEMBUAT_P_SDM')
alter table penandatanganan
   drop constraint FK_PENANDAT_PEMBUAT_P_SDM
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sdm') and o.name = 'FK_SDM_JENIS_SDM_JENIS_SD')
alter table sdm
   drop constraint FK_SDM_JENIS_SDM_JENIS_SD
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('sdm') and o.name = 'FK_SDM_SPESIMEN__SPESIMEN')
alter table sdm
   drop constraint FK_SDM_SPESIMEN__SPESIMEN
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('spesimen_tanda_tangan') and o.name = 'FK_SPESIMEN_SPESIMEN__SDM')
alter table spesimen_tanda_tangan
   drop constraint FK_SPESIMEN_SPESIMEN__SDM
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('anggota_tandatangan')
            and   name  = 'anggota_penandatangan_fk'
            and   indid > 0
            and   indid < 255)
   drop index anggota_tandatangan.anggota_penandatangan_fk
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('anggota_tandatangan')
            and   name  = 'penandatangan_anggota_fk'
            and   indid > 0
            and   indid < 255)
   drop index anggota_tandatangan.penandatangan_anggota_fk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('anggota_tandatangan')
            and   type = 'U')
   drop table anggota_tandatangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('dokumen')
            and   type = 'U')
   drop table dokumen
go

if exists (select 1
            from  sysobjects
           where  id = object_id('jenis_sdm')
            and   type = 'U')
   drop table jenis_sdm
go

if exists (select 1
            from  sysobjects
           where  id = object_id('log_tanda_tangan')
            and   type = 'U')
   drop table log_tanda_tangan
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('penandatanganan')
            and   name  = 'pembuat_penandatangan_fk'
            and   indid > 0
            and   indid < 255)
   drop index penandatanganan.pembuat_penandatangan_fk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('penandatanganan')
            and   type = 'U')
   drop table penandatanganan
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('sdm')
            and   name  = 'jenis_sdm_fk'
            and   indid > 0
            and   indid < 255)
   drop index sdm.jenis_sdm_fk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('sdm')
            and   type = 'U')
   drop table sdm
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('spesimen_tanda_tangan')
            and   name  = 'spesimen_tanda_tangan_pk'
            and   indid > 0
            and   indid < 255)
   drop index spesimen_tanda_tangan.spesimen_tanda_tangan_pk
go

if exists (select 1
            from  sysobjects
           where  id = object_id('spesimen_tanda_tangan')
            and   type = 'U')
   drop table spesimen_tanda_tangan
go

if exists (select 1
            from  sysobjects
           where  id = object_id('versi_db')
            and   type = 'U')
   drop table versi_db
go

create rule R_boolean as
      @column in (0,1)
go

create rule R_golongan_darah as
      @column in ('O','O-','O+','A','A-','A+','B','B-','B+','AB','AB-','AB+')
go

create rule R_jenis_kelamin as
      @column in ('L','P','*')
go

/*==============================================================*/
/* Table: anggota_tandatangan                                   */
/*==============================================================*/
create table anggota_tandatangan (
   id_anggota_penandatangan int                  identity,
   id_sdm               uniqueidentifier     not null,
   id_penandatanganan   uniqueidentifier     not null,
   is_sign              numeric(1)           null 
      constraint CKC_IS_SIGN_ANGGOTA_ check (is_sign is null or (is_sign in (0,1))),
   urutan               int                  null,
   tag                  char(1)              null,
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   constraint PK_ANGGOTA_TANDATANGAN primary key (id_anggota_penandatangan)
)
go

/*==============================================================*/
/* Index: penandatangan_anggota_fk                              */
/*==============================================================*/




create nonclustered index penandatangan_anggota_fk on anggota_tandatangan (id_penandatanganan ASC)
go

/*==============================================================*/
/* Index: anggota_penandatangan_fk                              */
/*==============================================================*/




create nonclustered index anggota_penandatangan_fk on anggota_tandatangan (id_sdm ASC)
go

/*==============================================================*/
/* Table: dokumen                                               */
/*==============================================================*/
create table dokumen (
   id_dokumen           uniqueidentifier     not null,
   id_penandatanganan   uniqueidentifier     null,
   id_dokumen_bsre      varchar(255)         null,
   nama_dokumen         varchar(255)         null,
   nama_file            varchar(255)         null,
   mime                 varchar(150)         null,
   ekstensi             varchar(20)          null,
   keterangan           varchar(512)         null,
   ukuran               bigint               null,
   file_id              varchar(512)         null,
   public_uri           varchar(512)         null,
   bucket_name          varchar(100)         null,
   project_id           varchar(100)         null,
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   constraint PK_DOKUMEN primary key (id_dokumen)
)
go

/*==============================================================*/
/* Table: jenis_sdm                                             */
/*==============================================================*/
create table jenis_sdm (
   id_jenis_sdm         int                  not null,
   nama                 varchar(255)         null,
   created_at           datetime             not null,
   updated_at           datetime             not null,
   expired_at           datetime             null,
   constraint PK_JENIS_SDM primary key (id_jenis_sdm)
)
go

/*==============================================================*/
/* Table: log_tanda_tangan                                      */
/*==============================================================*/
create table log_tanda_tangan (
   id                   bigint               not null,
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   id_sdm               uniqueidentifier     null,
   method               varchar(10)          null,
   url                  varchar(100)         null,
   client_info          varchar(512)         null,
   ip_address           varchar(50)          null,
   system               varchar(255)         null,
   nama_file            varchar(512)         null,
   response             varchar(Max)         null,
   constraint PK_LOG_TANDA_TANGAN primary key (id)
)
go

/*==============================================================*/
/* Table: penandatanganan                                       */
/*==============================================================*/
create table penandatanganan (
   id_penandatanganan   uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   judul                varchar(1024)        null,
   type                 int                  null,
   is_footer_exist      numeric(1)           null 
      constraint CKC_IS_FOOTER_EXIST_PENANDAT check (is_footer_exist is null or (is_footer_exist in (0,1))),
   tag                  char(1)              null,
   is_bulk_sign         numeric(1)           null 
      constraint CKC_IS_BULK_SIGN_PENANDAT check (is_bulk_sign is null or (is_bulk_sign in (0,1))),
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   constraint PK_PENANDATANGANAN primary key (id_penandatanganan)
)
go

/*==============================================================*/
/* Index: pembuat_penandatangan_fk                              */
/*==============================================================*/




create nonclustered index pembuat_penandatangan_fk on penandatanganan (id_sdm ASC)
go

/*==============================================================*/
/* Table: sdm                                                   */
/*==============================================================*/
create table sdm (
   id_sdm               uniqueidentifier     not null,
   id_spesimen          uniqueidentifier     null,
   id_jenis_sdm         int                  not null,
   sso_user_id          uniqueidentifier     null,
   nik                  char(16)             null,
   gelar_depan          varchar(100)         null,
   nama                 varchar(512)         null,
   gelar_belakang       varchar(100)         null,
   jenis_kelamin        char(1)              null 
      constraint CKC_JENIS_KELAMIN_SDM check (jenis_kelamin is null or (jenis_kelamin in ('L','P','*'))),
   tempat_lahir         varchar(100)         null,
   tgl_lahir            datetime             null,
   no_reg               varchar(100)         null,
   primary_email        varchar(255)         null,
   primary_email_verified numeric(1)           null 
      constraint CKC_PRIMARY_EMAIL_VER_SDM check (primary_email_verified is null or (primary_email_verified in (0,1))),
   alternate_email      varchar(255)         null,
   alternate_email_verified numeric(1)           null 
      constraint CKC_ALTERNATE_EMAIL_V_SDM check (alternate_email_verified is null or (alternate_email_verified in (0,1))),
   phone                varchar(16)          null,
   phone_verified       numeric(1)           null 
      constraint CKC_PHONE_VERIFIED_SDM check (phone_verified is null or (phone_verified in (0,1))),
   is_confirmed         numeric(1)           null 
      constraint CKC_IS_CONFIRMED_SDM check (is_confirmed is null or (is_confirmed in (0,1))),
   is_terdaftar_bsre    numeric(1)           null 
      constraint CKC_IS_TERDAFTAR_BSRE_SDM check (is_terdaftar_bsre is null or (is_terdaftar_bsre in (0,1))),
   enabled              numeric(1)           null 
      constraint CKC_ENABLED_SDM check (enabled is null or (enabled in (0,1))),
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   constraint PK_SDM primary key (id_sdm)
)
go

/*==============================================================*/
/* Index: jenis_sdm_fk                                          */
/*==============================================================*/




create nonclustered index jenis_sdm_fk on sdm (id_jenis_sdm ASC)
go

/*==============================================================*/
/* Table: spesimen_tanda_tangan                                 */
/*==============================================================*/
create table spesimen_tanda_tangan (
   id_spesimen          uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   data                 varchar(Max)         null,
   created_at           datetime             not null,
   updated_at           datetime             not null,
   deleted_at           datetime             null,
   updater              uniqueidentifier     null,
   constraint PK_SPESIMEN_TANDA_TANGAN primary key nonclustered (id_spesimen)
)
go

/*==============================================================*/
/* Index: spesimen_tanda_tangan_pk                              */
/*==============================================================*/




create unique clustered index spesimen_tanda_tangan_pk on spesimen_tanda_tangan (id_sdm ASC)
go

/*==============================================================*/
/* Table: versi_db                                              */
/*==============================================================*/
create table versi_db (
   id_versi             varchar(10)          not null,
   tanggal              datetime             not null default GETDATE(),
   constraint PK_VERSI_DB primary key (id_versi)
)
go

alter table anggota_tandatangan
   add constraint FK_ANGGOTA__ANGGOTA_P_SDM foreign key (id_sdm)
      references sdm (id_sdm)
go

alter table anggota_tandatangan
   add constraint FK_ANGGOTA__PENANDATA_PENANDAT foreign key (id_penandatanganan)
      references penandatanganan (id_penandatanganan)
go

alter table dokumen
   add constraint FK_DOKUMEN_DOKUMEN_P_PENANDAT foreign key (id_penandatanganan)
      references penandatanganan (id_penandatanganan)
go

alter table penandatanganan
   add constraint FK_PENANDAT_PEMBUAT_P_SDM foreign key (id_sdm)
      references sdm (id_sdm)
go

alter table sdm
   add constraint FK_SDM_JENIS_SDM_JENIS_SD foreign key (id_jenis_sdm)
      references jenis_sdm (id_jenis_sdm)
go

alter table sdm
   add constraint FK_SDM_SPESIMEN__SPESIMEN foreign key (id_spesimen)
      references spesimen_tanda_tangan (id_spesimen)
go

alter table spesimen_tanda_tangan
   add constraint FK_SPESIMEN_SPESIMEN__SDM foreign key (id_sdm)
      references sdm (id_sdm)
go

