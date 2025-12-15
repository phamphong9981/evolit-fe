export interface Student {
    id: number;
    code: string;
    fullName: string;
    dob?: string;
    parentName?: string;
    parentPhone?: string;
    currentSchool?: string;
    createdAt?: string;
    updatedAt?: string;
    enrollments?: Enrollment[];
}

export interface Enrollment {
    id: number;
    classId: number;
    startDate: string;
    status: string;
}

export interface CreateStudentDto {
    code: string;
    fullName: string;
    dob?: string;
    parentName?: string;
    parentPhone?: string;
    currentSchool?: string;
}

export interface UpdateStudentDto {
    fullName?: string;
    dob?: string;
    parentName?: string;
    parentPhone?: string;
    currentSchool?: string;
}


