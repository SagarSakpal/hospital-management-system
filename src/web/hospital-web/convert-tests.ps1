# Script to convert test files from done() callbacks to async/await# This demonstrates the conversion pattern for remaining test files# Manual conversion guide:# 1. Add: import { firstValueFrom } from 'rxjs';
# 2. Change: it('test', (done) => {  -> it('test', async () => {
# 3. Before subscribe, add: const promise = firstValueFrom(service.method());
# 4. Move HTTP expectations before subscribe
# 5. Replace: service.method().subscribe(result => { expect... done(); })
#    With: const result = await promise; expect...
# 6. Replace: done.fail('message') -> await expect(promise).rejects.toMatchObject({ status: XXX })# Files to convert:
# - doctors.service.spec.ts
# - appointments.service.spec.ts
# - medical-records.service.spec.ts
# - lookup.service.spec.ts
# - relationships.service.spec.ts
# - search.service.spec.ts# Example conversion:
## BEFORE:
#   it('should do something', (done) => {
#     service.getData().subscribe(result => {
#       expect(result).toBe(expected);
#       done();
#     });
#     const req = httpMock.expectOne('url');
#     req.flush(mockData);
#   });
## AFTER:
#   it('should do something', async () => {
#     const promise = firstValueFrom(service.getData());
#     
#     const req = httpMock.expectOne('url');
#     req.flush(mockData);
#     
#     const result = await promise;
#     expect(result).toBe(expected);
#   });

Write-Host "Test Conversion Pattern Guide Created" -ForegroundColor Green
Write-Host ""
Write-Host "The patients.service.spec.ts has been converted as a complete example." -ForegroundColor Yellow
Write-Host "Use this as a reference to convert the remaining service test files." -ForegroundColor Yellow
Write-Host ""
Write-Host "Key changes needed in each file:" -ForegroundColor Cyan
Write-Host "1. Import: import { firstValueFrom } from 'rxjs';" -ForegroundColor White
Write-Host "2. Change (done) to async" -ForegroundColor White
Write-Host "3. Use firstValueFrom() pattern" -ForegroundColor White
Write-Host "4. Replace done.fail() with await expect().rejects" -ForegroundColor White
