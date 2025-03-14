export class CreateInstanceDto {
    title: string
    description: string
}

export class ExtendedCreateInstanceDto extends CreateInstanceDto {
    createdBy?
}
