export interface paths {
    "/auth/kakao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        destination: string;
                    };
                };
            };
            responses: {
                /** @description 카카오 로그인 URL을 반환합니다 */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            url: string;
                        };
                    };
                };
                /** @description 잘못된 URL을 전달하였을 때 반환되는 값이에요 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 400;
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @deprecated
         * @description This is only used for internal oauth process. Do not use this.
         */
        get: {
            parameters: {
                query: {
                    code: string;
                    state: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 로그인 성공 */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 잘못된 요청 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 400;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 유저 정보를 반환합니다 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: number;
                            profile: {
                                nickname: string;
                                birthday: string;
                                job: string;
                                worries: {
                                    id: number;
                                    text: string;
                                }[];
                            } | null;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        nickname: string;
                        birthday: {
                            year: number;
                            month: number;
                            day: number;
                        };
                        jobId: number;
                        worryIds: number[];
                        gender: "male" | "female" | "none";
                    };
                };
            };
            responses: {
                /** @description 유저 프로필이 정상적으로 생성되었습니다. 요청을 보낼 때 전달한 값으로 유저 상태를 업데이트 하거나 유저 정보를 다시 요청해주세요 */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Form으로 전달된 값이 유효하지 않은 경우에 해당합니다. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 400;
                            error: string;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description 유저를 로그아웃 시킵니다 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 성공적으로 로그아웃이 완료된 경우 입니다 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/questions/today": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 오늘 만들어진 질문과 이에 대한 유저의 답변을 반환합니다. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 오늘 만들어진 질문과 이에 대한 유저의 답변을 반환합니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            userAnswered: true;
                            question: string;
                            questionId: number;
                            answer: string;
                            answerId: number;
                        } | {
                            /** @enum {boolean} */
                            userAnswered: false;
                            question: string;
                            questionId: number;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
                /** @description 오늘 만들어진 질문이 없을 때 반환되는 응답입니다. 오늘의 기준은 UTC+09:00 입니다. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/questions/{id}/answers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 질문에 대한 유저의 답변을 조회합니다. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 유저가 작성한 답변과 그에 관한 질문 정보를 반환합니다. 유저가 답변하지 않았을 경우 null을 리턴합니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            answer: {
                                id: number;
                                answer: string;
                                ownerId: number;
                            } | null;
                            question: {
                                id: number;
                                question: string;
                            };
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        /** 질문에 대한 답변을 추가하거나 수정합니다. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        answer: string;
                    };
                };
            };
            responses: {
                /** @description 이미 답변이 있는 경우 해당 답변을 수정합니다. 그렇지 않은 경우 해당 답변을 추가합니다. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            answerId: number;
                            answer: string;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
                /** @description 답변이 대상이 되는 질문이 '오늘'이 아닐 때 반환되는 응답입니다. 오늘의 기준은 UTC+09:00 입니다. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/questions/answers/{answerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 유저가 남긴 답변에 대해 필터링 과정을 거쳐 반환합니다. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    answerId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 유저가 보낸 요청에 대해 더이상 페이지네이션할 것이 없다면 hasMore가 false로 반환됩니다. hasMore는 클라이언트가 더이상 페칭을 할지 안할지를 결정하는 기준입니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: number;
                            answer: string;
                            question: string;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
                /** @description 작성자는 답변을 비공개설정하였고, 다른 유저가 이 답변을 보려고 조회하였을 때 리턴합니다 */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 403;
                            error: string;
                        };
                    };
                };
                /** @description 해당 id에 바인딩 된 답변이 없을 때 리턴합니다 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 404;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** 질문에 대한 답변을 삭제합니다. */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    answerId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 답변이 삭제되었을 때 반환되는 응답입니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 삭제하려는 답변이 유저가 남긴 답변이 아닐 때 반환되는 응답입니다. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
                /** @description 삭제하려는 답변이 존재하지 않을 때 반환되는 응답입니다. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/questions/answers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 유저가 남긴 답변에 대해 필터링 과정을 거쳐 반환합니다. */
        get: {
            parameters: {
                query: {
                    startYear: string;
                    startMonth: string;
                    endYear: string;
                    endMonth: string;
                    nextCursor?: string;
                    limit?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 유저가 보낸 요청에 대해 더이상 페이지네이션할 것이 없다면 hasMore가 false로 반환됩니다. hasMore는 클라이언트가 더이상 페칭을 할지 안할지를 결정하는 기준입니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            hasMore: true;
                            nextCursor: number;
                            list: {
                                questionId: number;
                                question: string;
                                answerId: number;
                                answer: string;
                                createdAt: string;
                            }[];
                        } | {
                            /** @enum {boolean} */
                            hasMore: false;
                            /** @enum {undefined} */
                            nextCursor?: null;
                            list: {
                                questionId: number;
                                question: string;
                                answerId: number;
                                answer: string;
                                createdAt: string;
                            }[];
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 직업 목록을 반환합니다 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: number;
                            name: string;
                        }[];
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/worries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 걱정들을 반환합니다. 걱정 마세요, 우리 삶에서 걱정은 별로 없으니까요 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: number;
                            name: string;
                        }[];
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recommendation_nickname": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 추천 닉네임을 올바르게 조회한 경우에 해당합니다. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            nickname: string;
                        };
                    };
                };
                /** @description 세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다! */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 401;
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
