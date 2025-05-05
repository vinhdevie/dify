create table app_account_joins
(
    id         uuid         default uuid_generate_v4() not null
        primary key,
    account_id uuid                                    not null,
    app_id     uuid                                    not null,
    permission varchar(255)                            not null,
    created_by uuid,
    created_at timestamp(0) default CURRENT_TIMESTAMP  not null,
    updated_by uuid,
    updated_at timestamp(0) default CURRENT_TIMESTAMP  not null
);