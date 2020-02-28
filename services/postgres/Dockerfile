ARG POSTGRES_TAG

FROM postgres:${POSTGRES_TAG}

COPY scripts/dbimp.sh /usr/local/bin/dbimp.sh

RUN chmod +x /usr/local/bin/dbimp.sh && chown root:root /usr/local/bin/dbimp.sh